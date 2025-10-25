import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InvoiceCard from '../components/InvoiceCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useData } from '../contexts/DataContext';
import { formatCurrency } from '../lib/formatters';
import {
  Search,
  ChevronDown,
  FileText,
  Plus,
  DollarSign,
} from 'lucide-react';

type FilterStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'outstanding' | 'paid_mtd' | 'partially_paid';
type SortOption = 'newest' | 'oldest' | 'highest' | 'due-soon';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { invoices, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [focusedInvoiceId, setFocusedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const focusParam = searchParams.get('focus');

    if (statusParam && ['all', 'draft', 'sent', 'paid', 'overdue', 'outstanding', 'paid_mtd', 'partially_paid'].includes(statusParam)) {
      setFilterStatus(statusParam as FilterStatus);
    }

    if (focusParam) {
      setFocusedInvoiceId(focusParam);
      setTimeout(() => {
        const element = document.getElementById(`invoice-${focusParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams]);

  const filterInvoices = () => {
    let filtered = invoices;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    if (filterStatus === 'draft') {
      filtered = filtered.filter((inv) => inv.status === 'draft');
    } else if (filterStatus === 'sent') {
      filtered = filtered.filter((inv) => inv.status === 'sent' || inv.status === 'viewed');
    } else if (filterStatus === 'paid') {
      filtered = filtered.filter((inv) => inv.status === 'paid');
    } else if (filterStatus === 'paid_mtd') {
      filtered = filtered.filter((inv) =>
        inv.status === 'paid' &&
        new Date(inv.paid_at || inv.created_at) >= monthStart
      );
    } else if (filterStatus === 'overdue') {
      filtered = filtered.filter((inv) => inv.status === 'overdue');
    } else if (filterStatus === 'outstanding') {
      filtered = filtered.filter((inv) =>
        inv.status === 'sent' ||
        inv.status === 'viewed' ||
        inv.status === 'partially_paid'
      );
    } else if (filterStatus === 'partially_paid') {
      filtered = filtered.filter((inv) => inv.status === 'partially_paid');
    }

    if (searchQuery) {
      filtered = filtered.filter((inv) => {
        const query = searchQuery.toLowerCase();
        return (
          inv.invoice_number.toLowerCase().includes(query) ||
          inv.customer?.name.toLowerCase().includes(query) ||
          inv.job?.title.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  };

  const sortInvoices = (invoicesToSort: typeof invoices) => {
    const sorted = [...invoicesToSort];

    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'highest':
        return sorted.sort((a, b) => b.total - a.total);
      case 'due-soon':
        return sorted.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
      default:
        return sorted;
    }
  };

  const getStatusCount = (status: FilterStatus): number => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    if (status === 'all') return invoices.length;
    if (status === 'draft') return invoices.filter((i) => i.status === 'draft').length;
    if (status === 'sent') return invoices.filter((i) => i.status === 'sent' || i.status === 'viewed').length;
    if (status === 'paid') return invoices.filter((i) => i.status === 'paid').length;
    if (status === 'paid_mtd') return invoices.filter((i) =>
      i.status === 'paid' &&
      new Date(i.paid_at || i.created_at) >= monthStart
    ).length;
    if (status === 'overdue') return invoices.filter((i) => i.status === 'overdue').length;
    if (status === 'outstanding') return invoices.filter((i) =>
      i.status === 'sent' ||
      i.status === 'viewed' ||
      i.status === 'partially_paid'
    ).length;
    if (status === 'partially_paid') return invoices.filter((i) => i.status === 'partially_paid').length;
    return 0;
  };

  const filteredAndSortedInvoices = sortInvoices(filterInvoices());

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Invoices</h1>
            <p className="text-gray-400 mt-1">Manage billing and payments</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/invoices/new')}
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Invoice
          </button>
        </div>

        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create your first invoice to bill customers for completed work"
            actionLabel="Create First Invoice"
            onAction={() => navigate('/dashboard/invoices/new')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Total Outstanding</p>
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalOutstanding)}</p>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Total Paid</p>
                  <DollarSign className="w-5 h-5 text-accent-green" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalPaid)}</p>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Overdue</p>
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">{getStatusCount('overdue')}</p>
              </div>

              <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Total Invoices</p>
                  <FileText className="w-5 h-5 text-accent-cyan" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">{invoices.length}</p>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="appearance-none pl-4 pr-10 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent bg-dark-card text-white"
                  >
                    <option value="all">All ({getStatusCount('all')})</option>
                    <option value="draft">Drafts ({getStatusCount('draft')})</option>
                    <option value="sent">Sent ({getStatusCount('sent')})</option>
                    <option value="outstanding">Outstanding (incl. Partially Paid) ({getStatusCount('outstanding')})</option>
                    <option value="partially_paid">Partially Paid ({getStatusCount('partially_paid')})</option>
                    <option value="paid">Paid ({getStatusCount('paid')})</option>
                    <option value="overdue">Overdue ({getStatusCount('overdue')})</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="appearance-none pl-4 pr-10 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent bg-dark-card text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="due-soon">Due Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredAndSortedInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No invoices match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAndSortedInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    id={`invoice-${invoice.id}`}
                    className={focusedInvoiceId === invoice.id ? 'ring-2 ring-accent-cyan rounded-lg' : ''}
                  >
                    <InvoiceCard invoice={invoice} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
  );
}
