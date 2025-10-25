import { Customer } from '../types/customer';
import { Phone, Mail, MessageSquare, Briefcase } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export default function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const fullName = `${customer.firstName} ${customer.lastName}`;

  const formatTimeAgo = (date?: Date | string) => {
    if (!date) return 'Never';
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Never';
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);

    if (months > 0) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else {
      return 'Today';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-lg font-bold text-white truncate">
            {fullName}
          </h3>
          {customer.businessName && (
            <p className="text-sm text-gray-400 truncate">{customer.businessName}</p>
          )}
          <div className="flex flex-col text-sm text-gray-400 mt-2 space-y-1">
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-2" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-2" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
          </div>
          {customer.address && (
            <p className="text-xs text-gray-400 truncate mt-1">
              {customer.address}, {customer.city}, {customer.state}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xl font-bold text-white">
            {formatCurrency(customer.totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total Revenue</p>
          {customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 justify-end">
              {customer.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="bg-accent-cyan/10 text-accent-cyan text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-dark-border">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{customer.totalJobs}</p>
          <p className="text-xs text-gray-400">Jobs</p>
        </div>
        <div className="text-center border-l border-r border-dark-border">
          <p className="text-lg font-bold text-white">
            {formatCurrency(customer.averageJobValue)}
          </p>
          <p className="text-xs text-gray-400">Avg Value</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Last Job</p>
          <p className="text-xs font-semibold text-white">
            {formatTimeAgo(customer.lastJobDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-border">
        <div className="flex items-center space-x-2">
          <a
            href={`tel:${customer.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={`sms:${customer.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
            title="Text"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-gray-400 hover:bg-dark-bg rounded-lg transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            alert('Create new job for customer');
          }}
          className="flex items-center text-sm font-medium text-accent-cyan hover:text-accent-teal px-3 py-1.5 border border-accent-cyan rounded-lg hover:bg-accent-cyan/10 transition-colors"
        >
          <Briefcase className="w-4 h-4 mr-1" />
          New Job
        </button>
      </div>

      {customer.outstandingBalance > 0 && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <p className="text-sm text-orange-500 font-semibold">
            Outstanding: {formatCurrency(customer.outstandingBalance)}
          </p>
        </div>
      )}
    </div>
  );
}
