import { Job, JobStatus } from '../types/job';
import { Eye, Bell, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

const statusConfig: Record<
  JobStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  draft: { label: 'Draft', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400' },
  sent: { label: 'Sent', bgColor: 'bg-accent-cyan/10', textColor: 'text-accent-cyan' },
  viewed: { label: 'Viewed', bgColor: 'bg-accent-teal/10', textColor: 'text-accent-teal' },
  signed: { label: 'Signed', bgColor: 'bg-accent-green/10', textColor: 'text-accent-green' },
  'in-progress': {
    label: 'In Progress',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-accent-green/10',
    textColor: 'text-accent-green',
  },
  paid: { label: 'Paid', bgColor: 'bg-accent-green/20', textColor: 'text-accent-green' },
};

export default function JobCard({ job, onClick }: JobCardProps) {
  const statusStyle = statusConfig[job.status];

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return 'Unknown';

    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return 'Unknown';

    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else {
      return 'Just now';
    }
  };

  const getLastActivityText = () => {
    if (!job.activities || job.activities.length === 0) return '';
    const lastActivity = job.activities[job.activities.length - 1];
    if (!lastActivity) return '';

    switch (lastActivity.type) {
      case 'viewed':
        return `Viewed ${formatTimeAgo(lastActivity.timestamp)}`;
      case 'signed':
        return `Signed ${formatTimeAgo(lastActivity.timestamp)}`;
      case 'sent':
        return `Sent ${formatTimeAgo(lastActivity.timestamp)}`;
      case 'started':
        return `Started ${formatTimeAgo(lastActivity.timestamp)}`;
      case 'completed':
        return `Completed ${formatTimeAgo(lastActivity.timestamp)}`;
      case 'paid':
        return `Paid ${formatTimeAgo(lastActivity.timestamp)}`;
      default:
        return formatTimeAgo(lastActivity.timestamp);
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
            {job.customerName || (
              <span className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="w-4 h-4" />
                No Customer Attached
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-300 truncate">{job.jobTitle}</p>
          <p className="text-xs text-gray-400 truncate mt-1">{job.address}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xl font-bold text-white">
            {formatCurrency(job.price)}
          </p>
          <span
            className={`${statusStyle.bgColor} ${statusStyle.textColor} text-xs font-semibold px-3 py-1 rounded-full mt-2`}
          >
            {statusStyle.label}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-border">
        <div className="flex flex-col text-xs text-gray-400">
          <span>Created {formatTimeAgo(job.createdAt)}</span>
          {job.status !== 'draft' && (
            <span className="mt-1">{getLastActivityText()}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {job.status !== 'draft' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert('View job details');
                }}
                className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              {(job.status === 'sent' || job.status === 'viewed') && (
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
              {(job.status === 'signed' || job.status === 'completed') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Create invoice');
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Create Invoice"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
