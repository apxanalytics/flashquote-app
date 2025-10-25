import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryLink?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  secondaryLabel,
  secondaryLink,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-teal/10 rounded-full w-24 h-24 flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-accent-cyan" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{description}</p>
      {action ? (
        action
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionLabel && (actionLink || onAction) && (
            actionLink ? (
              <Link
                to={actionLink}
                className="text-white px-6 py-3 rounded-lg font-semibold transition-all"
                style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                {actionLabel}
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="text-white px-6 py-3 rounded-lg font-semibold transition-all"
                style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                {actionLabel}
              </button>
            )
          )}
          {secondaryLabel && secondaryLink && (
            <Link
              to={secondaryLink}
              className="bg-dark-card text-gray-400 px-6 py-3 rounded-lg font-semibold border-2 border-dark-border hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
