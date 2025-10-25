import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings, dismissChecklist, markChecklistComplete } from '../lib/userProgress';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
}

export default function GettingStartedChecklist() {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'Complete business profile', completed: false, link: '/dashboard/settings' },
    { id: '2', label: 'Create first proposal', completed: false, link: '/dashboard/new-job' },
    { id: '3', label: 'Send an invoice', completed: false, link: '/dashboard/invoices/new' },
    { id: '4', label: 'Add a customer', completed: false, link: '/dashboard/customers' },
  ]);

  useEffect(() => {
    loadChecklistStatus();
  }, [user]);

  const loadChecklistStatus = async () => {
    if (!user) return;

    try {
      const settings = await getUserSettings(user.id);

      if (settings) {
        setIsDismissed(settings.checklist_skipped || !!settings.checklist_completed_at);

        setItems([
          { id: '1', label: 'Complete business profile', completed: settings.has_business_profile, link: '/dashboard/settings' },
          { id: '2', label: 'Create first proposal', completed: settings.has_first_proposal, link: '/dashboard/new-job' },
          { id: '3', label: 'Send an invoice', completed: settings.has_first_invoice, link: '/dashboard/invoices/new' },
          { id: '4', label: 'Add a customer', completed: settings.has_first_customer, link: '/dashboard/customers' },
        ]);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  useEffect(() => {
    if (completedCount === items.length && user && !loading) {
      markChecklistComplete(user.id).catch(console.error);
    }
  }, [completedCount, items.length, user, loading]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDismiss = async () => {
    if (user) {
      await dismissChecklist(user.id).catch(console.error);
    }
    setIsDismissed(true);
  };

  if (loading || isDismissed || completedCount === items.length) {
    return null;
  }

  return (
    <div className="relative bg-dark-card rounded-xl shadow-sm border border-dark-border overflow-hidden mb-6">
      <div
        className="rounded-t-xl px-4 py-2 text-white font-semibold tracking-wide"
        style={{ background: "linear-gradient(135deg,#3B82F6 0%,#60A5FA 60%,#8B5CF6 100%)" }}
      >
        Getting Started
      </div>
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-dark-bg rounded-full h-2 max-w-xs">
                <div
                  className="bg-gradient-to-r from-accent-cyan to-accent-teal h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-white">
                {completedCount}/{items.length}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-3 group">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex-shrink-0 text-gray-400 group-hover:text-accent-cyan transition-colors"
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-accent-green" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                {item.link ? (
                  <Link
                    to={item.link}
                    className={`flex-1 text-sm hover:text-accent-cyan transition-colors ${
                      item.completed ? 'text-gray-500 line-through' : 'text-gray-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`flex-1 text-sm ${
                      item.completed ? 'text-gray-500 line-through' : 'text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {index === items.length - 1 && (
                  <button
                    onClick={handleDismiss}
                    className="text-sm font-semibold text-red-400 hover:text-red-300"
                  >
                    Skip
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
