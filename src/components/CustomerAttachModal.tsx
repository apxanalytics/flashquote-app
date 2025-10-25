import { useState, useEffect } from 'react';
import { X, Search, Plus, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CustomerAttachModalProps {
  jobId: string;
  onClose: () => void;
  onAttached: (customerId: string, customerName: string) => void;
}

export default function CustomerAttachModal({ jobId, onClose, onAttached }: CustomerAttachModalProps) {
  const [tab, setTab] = useState<'select' | 'create'>('select');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `/functions/v1/list-customers`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to load customers');

      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAttachCustomer(customerId: string) {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `/functions/v1/attach-customer`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId, customer_id: customerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to attach customer');
      }

      const customer = customers.find(c => c.id === customerId);
      onAttached(customerId, customer?.name || 'Unknown');
    } catch (err: any) {
      setError(err.message);
      console.error('Error attaching customer:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer() {
    if (!newCustomer.name.trim()) {
      setError('Customer name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const cleanEmail = newCustomer.email?.trim() || null;
      const cleanPhone = newCustomer.phone ? newCustomer.phone.replace(/\D/g, "") : null;

      const apiUrl = `/functions/v1/create-customer`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCustomer.name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }

      const { id } = await response.json();

      await handleAttachCustomer(id);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating customer:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-dark-border">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-2xl font-bold text-white">Attach Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-dark-border">
          <button
            onClick={() => setTab('select')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              tab === 'select'
                ? 'text-accent-cyan border-b-2 border-accent-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Select Existing
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              tab === 'create'
                ? 'text-accent-cyan border-b-2 border-accent-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {tab === 'select' && (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No customers found</p>
                  <button
                    onClick={() => setTab('create')}
                    className="mt-4 text-accent-cyan hover:underline"
                  >
                    Create your first customer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleAttachCustomer(customer.id)}
                      disabled={loading}
                      className="w-full text-left p-4 bg-dark-bg border border-dark-border rounded-lg hover:border-accent-cyan transition-colors disabled:opacity-50"
                    >
                      <div className="font-semibold text-white">{customer.name}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-400 mt-1">{customer.email}</div>
                      )}
                      {customer.phone && (
                        <div className="text-sm text-gray-400">{customer.phone}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  placeholder="(555) 123-4567"
                />
              </div>

              <button
                onClick={handleCreateCustomer}
                disabled={loading || !newCustomer.name.trim()}
                className="w-full py-3 bg-accent-cyan text-dark-bg font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create & Attach Customer
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
