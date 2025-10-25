import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import QuickStatsCard from '../components/QuickStatsCard';
import ActivityFeedItem from '../components/ActivityFeedItem';
import GettingStartedChecklist from '../components/GettingStartedChecklist';
import SendInvoiceSplitButton from '../components/SendInvoiceSplitButton';
import AIAssistantTile from '../components/AIAssistantTile';
import FooterTile from '../components/FooterTile';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../lib/formatters';
import { getRecentActivity, getUserSettings } from '../lib/userProgress';
import type { ActivityLogEntry } from '../lib/userProgress';
import {
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Send,
  CheckCircle,
  Plus,
  Users,
  Mic,
  PenTool,
} from 'lucide-react';

export default function DashboardHomePage() {
  const { profile, user } = useAuth();
  const { jobs, invoices, activities, isLoading } = useData();
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState<ActivityLogEntry[]>([]);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    loadRecentActivity();
    checkProfileStatus();
  }, [user]);

  const loadRecentActivity = async () => {
    if (!user) return;

    try {
      const activity = await getRecentActivity(user.id, 5);
      setRecentActivities(activity);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const checkProfileStatus = async () => {
    if (!user) return;

    try {
      const settings = await getUserSettings(user.id);
      setNeedsProfile(!settings?.has_business_profile);
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const openProposals = jobs.filter(j => ['sent', 'viewed'].includes(j.status)).length;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const revenueMTD = invoices
    .filter(i => i.status === 'paid' && i.paid_at && new Date(i.paid_at) >= monthStart)
    .reduce((sum, i) => sum + Number(i.total), 0);

  const pendingAmount = invoices
    .filter(i => ['outstanding', 'partially_paid'].includes(i.status))
    .reduce((sum, i) => sum + Number(i.total), 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  const recentActivitiesBackup = [
    {
      icon: Send,
      iconBgColor: 'bg-blue-500',
      iconColor: 'text-white',
      text: 'Proposal sent to John Smith',
      time: '2 hours ago',
    },
    {
      icon: CheckCircle,
      iconBgColor: 'bg-green-500',
      iconColor: 'text-white',
      text: 'Payment received: $2,500',
      time: '5 hours ago',
    },
    {
      icon: Plus,
      iconBgColor: 'bg-pink-500',
      iconColor: 'text-white',
      text: 'New job created: Kitchen Remodel',
      time: '1 day ago',
    },
    {
      icon: FileText,
      iconBgColor: 'bg-red-500',
      iconColor: 'text-white',
      text: 'Invoice #1234 sent to Sarah Johnson',
      time: '1 day ago',
    },
    {
      icon: Users,
      iconBgColor: 'bg-blue-500',
      iconColor: 'text-white',
      text: 'New customer added: Mike Williams',
      time: '2 days ago',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Hey {profile?.owner_name?.split(' ')[0]}, ready to create your next proposal?
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your business today
        </p>
      </div>

      <GettingStartedChecklist />

      <div className="mb-8">
        <Link
          to="/dashboard/new-job"
          className="flex items-center justify-center w-full sm:w-auto sm:inline-flex text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg text-lg"
          style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}
        >
          <Mic className="w-6 h-6 mr-3" />
          Start New Job
        </Link>
      </div>

      <div className="mb-8">
        <AIAssistantTile />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard/jobs?status=sent')}
          className="text-left"
        >
          <QuickStatsCard
            title="Open Proposals"
            value={openProposals}
            icon={FileText}
            iconBgColor="bg-blue-500"
            iconColor="text-white"
          />
        </button>
        <button
          onClick={() => navigate('/dashboard/invoices?status=paid_mtd')}
          className="text-left"
        >
          <QuickStatsCard
            title="Revenue Month-to-Date"
            value={formatCurrency(revenueMTD)}
            icon={TrendingUp}
            iconBgColor="bg-green-500"
            iconColor="text-white"
          />
        </button>
        <button
          onClick={() => navigate('/dashboard/invoices?status=outstanding')}
          className="text-left"
        >
          <QuickStatsCard
            title="Pending Invoices"
            value={formatCurrency(pendingAmount)}
            icon={DollarSign}
            iconBgColor="bg-pink-500"
            iconColor="text-white"
          />
        </button>
        <button
          onClick={() => navigate('/dashboard/invoices?status=overdue')}
          className="text-left"
        >
          <QuickStatsCard
            title="Overdue Invoices"
            value={overdueInvoices}
            icon={AlertCircle}
            iconBgColor="bg-red-500"
            iconColor="text-white"
          />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-stretch mb-8">
        <div className="h-full">
          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6 h-full min-h-[420px] flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            </div>
            <div className="space-y-1">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const iconMap: Record<string, any> = {
                    proposal_created: Plus,
                    proposal_sent: Send,
                    proposal_signed: PenTool,
                    customer_added: Users,
                    invoice_sent: FileText,
                    payment_received: CheckCircle,
                    profile_completed: CheckCircle,
                  };

                  const colorMap: Record<string, string> = {
                    proposal_created: 'bg-gradient-to-br from-orange-500 to-orange-600',
                    proposal_sent: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    proposal_signed: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    customer_added: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    invoice_sent: 'bg-gradient-to-br from-red-500 to-red-600',
                    payment_received: 'bg-gradient-to-br from-green-500 to-green-600',
                    profile_completed: 'bg-gradient-to-br from-blue-500 to-blue-600',
                  };

                  const bgColor = colorMap[activity.type] || 'bg-gradient-to-br from-blue-500 to-blue-600';

                  const handleClick = () => {
                    if (activity.type.includes('invoice') && activity.ref_id) {
                      navigate(`/dashboard/invoices?focus=${activity.ref_id}`);
                    } else if ((activity.type.includes('proposal') || activity.type.includes('job')) && activity.ref_id) {
                      navigate(`/dashboard/jobs?focus=${activity.ref_id}`);
                    } else if (activity.type.includes('customer') && activity.ref_id) {
                      navigate(`/dashboard/customers?focus=${activity.ref_id}`);
                    }
                  };

                  return (
                    <button
                      key={activity.id}
                      onClick={handleClick}
                      className="w-full text-left hover:bg-dark-hover rounded-lg transition-colors"
                    >
                      <ActivityFeedItem
                        icon={iconMap[activity.type] || FileText}
                        iconBgColor={bgColor}
                        iconColor="text-white"
                        text={activity.title}
                        time={new Date(activity.created_at).toLocaleDateString()}
                      />
                    </button>
                  );
                })
              ) : activities.length > 0 ? (
                activities.slice(0, 5).map((activity, index) => {
                  const iconMap: Record<string, any> = {
                    created: Plus,
                    sent: Send,
                    viewed: FileText,
                    signed: PenTool,
                    paid: CheckCircle,
                  };

                  const colorMap: Record<string, string> = {
                    created: 'bg-gradient-to-br from-orange-500 to-orange-600',
                    sent: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    viewed: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    signed: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    paid: 'bg-gradient-to-br from-green-500 to-green-600',
                  };

                  const bgColor = colorMap[activity.action] || 'bg-gradient-to-br from-blue-500 to-blue-600';

                  return (
                    <ActivityFeedItem
                      key={activity.id}
                      icon={iconMap[activity.action] || FileText}
                      iconBgColor={bgColor}
                      iconColor="text-white"
                      text={activity.description}
                      time={new Date(activity.created_at).toLocaleDateString()}
                    />
                  );
                })
              ) : (
                recentActivitiesBackup.map((activity, index) => (
                  <ActivityFeedItem key={index} {...activity} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col gap-6">
          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard/new-job"
                className="flex items-center justify-center w-full bg-accent-cyan text-dark-bg px-4 py-3 rounded-lg font-semibold hover:bg-accent-teal shadow-sm hover-glow-blue focus-glow-blue transition-all duration-150"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Proposal
              </Link>
              <div className="relative">
                <SendInvoiceSplitButton />
              </div>
              <Link
                to="/dashboard/customers"
                className="flex items-center justify-center w-full bg-dark-bg text-accent-cyan border-2 border-accent-cyan px-4 py-3 rounded-lg font-semibold hover:bg-dark-border hover-glow-blue focus-glow-blue transition-all duration-150"
              >
                <Users className="w-5 h-5 mr-2" />
                View Customers
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl border border-[#1E3A8A] bg-[#0F172A] p-4">
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.15))" }}
            />
            <div className="relative space-y-3">
              <h3 className="text-lg font-semibold text-blue-200">AI Assistant Ready</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Talk to your AI to create proposals, invoices, or answer questions.
              </p>
              <Link
                to="/dashboard/new-job"
                className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-white font-medium shadow-sm hover-glow-blue focus-glow-blue transition-all duration-150"
                style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)" }}
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Talking
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FooterTile needsProfile={needsProfile} serviceArea={profile?.service_radius ? `${profile.service_radius} miles` : '50 miles'} />
    </div>
  );
}
