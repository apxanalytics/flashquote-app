import { Invoice, InvoiceStatus } from '../types/invoice';
import { Eye, Bell, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface InvoiceCardProps {
  invoice: Invoice;
  onClick: () => void;
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  draft: { label: 'Draft', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400' },
  sent: { label: 'Sent', bgColor: 'bg-accent-cyan/10', textColor: 'text-accent-cyan' },
  viewed: { label: 'Viewed', bgColor: 'bg-accent-teal/10', textColor: 'text-accent-teal' },
  'partially-paid': {
    label: 'Partially Paid',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
  },
  paid: { label: 'Paid', bgColor: 'bg-accent-green/10', textColor: 'text-accent-green' },
  overdue: { label: 'Overdue', bgColor: 'bg-red-500/10', textColor: 'text-red-500' },
};

export default function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  const statusStyle = statusConfig[invoice.status];

  const getDaysOverdue = () => {
    if (invoice.status !== 'overdue' || !invoice.dueDate) return 0;
    const now = new Date();
    const dueDateObj = typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate;
    if (isNaN(dueDateObj.getTime())) return 0;
    const diff = now.getTime() - dueDateObj.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const daysOverdue = getDaysOverdue();

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-lg font-bold text-white truncate">
            {invoice.customerName}
          </h3>
          <p className="text-sm text-gray-400">
            {invoice.invoiceNumber} • {formatDate(invoice.invoiceDate)}
          </p>
          {invoice.jobTitle && (
            <p className="text-xs text-gray-400 truncate mt-1">{invoice.jobTitle}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xl font-bold text-white">
            {formatCurrency(invoice.balanceDue)}
          </p>
          <span
            className={`${statusStyle.bgColor} ${statusStyle.textColor} text-xs font-semibold px-3 py-1 rounded-full mt-2 ${
              invoice.status === 'overdue' ? 'animate-pulse' : ''
            }`}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      {invoice.amountPaid > 0 && invoice.status !== 'paid' && (
        <div className="mb-3 text-sm text-gray-400">
          Paid: {formatCurrency(invoice.amountPaid)} of {formatCurrency(invoice.total)}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-border">
        <div className="flex flex-col text-xs">
          <span className="text-gray-400">Due: {formatDate(invoice.dueDate)}</span>
          {daysOverdue > 0 && (
            <span className="text-red-500 font-semibold mt-1">
              {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert('View invoice');
            }}
            className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {invoice.status !== 'paid' && invoice.status !== 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                alert('Send reminder');
              }}
              className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
              title="Send Reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
          {invoice.status !== 'paid' && invoice.status !== 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                alert('Record payment');
              }}
              className="p-2 text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors"
              title="Record Payment"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
