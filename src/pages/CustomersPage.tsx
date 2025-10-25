import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomerEditor from '../components/CustomerEditor';
import { useData } from '../contexts/DataContext';
import { customerInitials } from '../lib/initials';
import { formatPhone } from '../lib/formatters';
import { supabase } from '../lib/supabase';
import {
  Search,
  UserPlus,
  Users,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export default function CustomersPage() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const { customers, isLoading, refetchCustomers } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [focusedCustomerId, setFocusedCustomerId] = useState<string | null>(null);

  const jobAttachId = searchParams.get('attachToJob');

  useEffect(() => {
    const focusParam = searchParams.get('focus');
    if (focusParam) {
      setFocusedCustomerId(focusParam);
      setTimeout(() => {
        const element = document.getElementById(`customer-${focusParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams]);

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.first_name?.toLowerCase().includes(query) ||
      customer.last_name?.toLowerCase().includes(query) ||
      customer.business_name?.toLowerCase().includes(query)
    );
  });

  const handleCardClick = async (customer: any) => {
    if (!jobAttachId) {
      setSelectedCustomer(customer);
      setEditModal(true);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/functions/v1/attach-customer`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobAttachId, customer_id: customer.id }),
      });

      nav(`/dashboard/jobs/${jobAttachId}`);
    } catch (e: any) {
      alert(e.message || "Failed to attach customer");
    }
  };

  const handleCloseEdit = () => {
    setEditModal(false);
    setSelectedCustomer(null);
  };

  const handleSaved = async () => {
    setShowAddModal(false);
    setEditModal(false);
    setSelectedCustomer(null);
    await refetchCustomers();
  };

  const handleDeleted = async () => {
    setEditModal(false);
    setSelectedCustomer(null);
    await refetchCustomers();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Customers</h1>
            <p className="text-gray-400 mt-1">Manage your customer relationships</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Customer
          </button>
        </div>

        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start tracking jobs and sending proposals"
            actionLabel="Add First Customer"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  aria-label="Search customers by name, email, or phone"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No customers match your search</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    id={`customer-${customer.id}`}
                    className={`relative bg-dark-card rounded-2xl p-6 hover:bg-dark-hover cursor-pointer transition-all border border-dark-border ${
                      focusedCustomerId === customer.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleCardClick(customer)}
                  >
                    <div className="pr-20">
                      <div className="font-semibold text-white text-lg mb-1">
                        {customer.name}
                      </div>
                      <div className="text-gray-400 text-sm mb-4">
                        Customer since{' '}
                        {new Date(customer.created_at).toLocaleDateString()}
                      </div>

                      <div className="space-y-2">
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {formatPhone(customer.phone)}
                          </div>
                        )}

                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        )}

                        {(customer.street || customer.city || customer.state || customer.zip) && (
                          <div className="flex items-start text-sm text-gray-300">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                            <span>
                              {customer.street && <>{customer.street}<br /></>}
                              {customer.city && `${customer.city}`}
                              {customer.state && `, ${customer.state}`}
                              {customer.zip && ` ${customer.zip}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 right-6">
                      <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                        {customerInitials(customer)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <CustomerEditor
          open={showAddModal}
          mode="create"
          onClose={() => setShowAddModal(false)}
          onSaved={handleSaved}
        />

        <CustomerEditor
          open={editModal}
          mode="edit"
          initial={selectedCustomer}
          onClose={handleCloseEdit}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      </div>
  );
}
