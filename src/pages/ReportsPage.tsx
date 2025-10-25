import { useState, useEffect } from 'react';
import { analyticsService } from '../lib/analyticsService';
import type { RevenueDataPoint, AIInsight } from '../lib/analyticsService';
import { formatCurrency, formatNumber } from '../lib/formatters';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  DollarSign,
  Users,
  Download,
  Calendar,
  ChevronDown,
  Lightbulb,
  CheckCircle,
  XCircle,
} from 'lucide-react';

type TimePeriod = 'week' | 'month' | 'last-month' | 'year' | 'custom';

export default function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    revenue: { current: 0, previous: 0, percentChange: 0 },
    jobs: { current: 0, previous: 0, percentChange: 0 },
    winRate: { current: 0, previous: 0, percentChange: 0 },
    avgValue: { current: 0, previous: 0, percentChange: 0 },
  });

  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [jobStatusData, setJobStatusData] = useState<any>(null);
  const [revenueByType, setRevenueByType] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timePeriod]);

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (timePeriod) {
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: today };
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: today };
      }
      case 'last-month': {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start: lastMonthStart, end: lastMonthEnd };
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return { start: yearStart, end: today };
      }
      default:
        return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      const [revenue, jobs, winRate, avgValue, monthlyRevenue, pipeline, jobStatus, typeRevenue, aiInsights] = await Promise.all([
        analyticsService.calculateTotalRevenue(start, end),
        analyticsService.calculateJobsCompleted(start, end),
        analyticsService.calculateWinRate(start, end),
        analyticsService.calculateAverageJobValue(start, end),
        analyticsService.calculateMonthlyRevenue(12),
        analyticsService.calculateProposalPipeline(start, end),
        analyticsService.calculateJobStatusBreakdown(start, end),
        analyticsService.calculateRevenueByJobType(start, end),
        analyticsService.generateAIInsights(start, end)
      ]);

      setMetrics({ revenue, jobs, winRate, avgValue });
      setRevenueData(monthlyRevenue);
      setInsights(aiInsights);

      setPipelineData([
        { stage: 'Created', count: pipeline.stages.created, percentage: 100 },
        { stage: 'Sent', count: pipeline.stages.sent, percentage: pipeline.conversions.createdToSent },
        { stage: 'Viewed', count: pipeline.stages.viewed, percentage: pipeline.conversions.sentToViewed },
        { stage: 'Signed', count: pipeline.stages.signed, percentage: pipeline.conversions.viewedToSigned },
      ]);

      setJobStatusData([
        { status: 'Draft', count: jobStatus.counts.draft, color: 'bg-gray-400' },
        { status: 'Proposals Out', count: jobStatus.counts.proposalsOut, color: 'bg-blue-500' },
        { status: 'Active Jobs', count: jobStatus.counts.active, color: 'bg-green-500' },
        { status: 'Awaiting Payment', count: jobStatus.counts.awaitingPayment, color: 'bg-pink-500' },
        { status: 'Completed', count: jobStatus.counts.completedPaid, color: 'bg-accent-cyan' },
      ]);

      const colors = ['bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-red-500', 'bg-accent-cyan'];
      setRevenueByType(typeRevenue.map((item, idx) => ({
        type: item.type,
        revenue: item.revenue,
        color: colors[idx % colors.length]
      })));

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...(revenueData?.map((d) => d.revenue) || [1]));
  const totalJobs = jobStatusData?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  const maxTypeRevenue = Math.max(...(revenueByType?.map((d) => d.revenue) || [1]));

  const goals = [
    { name: 'Monthly Revenue', current: 45230, target: 50000, unit: '$' },
    { name: 'Jobs per Month', current: 18, target: 20, unit: '' },
    { name: 'Win Rate', current: 67, target: 70, unit: '%' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
          <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-400">Business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center bg-dark-card border-2 border-dark-border text-white px-4 py-2 rounded-lg hover:bg-dark-border transition-colors font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-lg shadow-xl border border-dark-border py-2 z-10">
                  <button className="w-full text-left px-4 py-2 hover:bg-dark-bg text-white">
                    Export as PDF
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-dark-bg text-white">
                    Export as Excel
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-dark-bg text-white">
                    Email Report
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-dark-bg text-white">
                    Schedule Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'last-month', label: 'Last Month' },
              { value: 'year', label: 'This Year' },
              { value: 'custom', label: 'Custom Range' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value as TimePeriod)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timePeriod === period.value
                    ? 'bg-accent-cyan text-dark-bg'
                    : 'bg-dark-card text-gray-400 border-2 border-dark-border hover:border-accent-cyan'
                }`}
              >
                {period.value === 'custom' && <Calendar className="w-4 h-4 inline mr-2" />}
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 rounded-lg p-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center text-sm font-semibold ${
                  metrics.revenue.percentChange > 0 ? 'text-accent-green' : 'text-red-500'
                }`}
              >
                {metrics.revenue.percentChange > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metrics.revenue.percentChange).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : formatCurrency(metrics.revenue.current)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              vs {formatCurrency(metrics.revenue.previous)} last period
            </p>
          </div>

          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 rounded-lg p-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center text-sm font-semibold ${
                  metrics.jobs.percentChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metrics.jobs.percentChange > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metrics.jobs.percentChange).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Jobs Completed</h3>
            <p className="text-3xl font-bold text-white">{loading ? '...' : metrics.jobs.current}</p>
            <p className="text-xs text-gray-400 mt-2">
              vs {metrics.jobs.previous} last period
            </p>
          </div>

          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-500 rounded-lg p-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center text-sm font-semibold ${
                  metrics.winRate.percentChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metrics.winRate.percentChange > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metrics.winRate.percentChange).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Proposal Win Rate</h3>
            <p className="text-3xl font-bold text-white">{loading ? '...' : metrics.winRate.current.toFixed(1)}%</p>
            <p className="text-xs text-gray-400 mt-2">
              vs {metrics.winRate.previous.toFixed(1)}% last period
            </p>
          </div>

          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-accent-cyan rounded-lg p-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div
                className={`flex items-center text-sm font-semibold ${
                  metrics.avgValue.percentChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metrics.avgValue.percentChange > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(metrics.avgValue.percentChange).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Average Job Value</h3>
            <p className="text-3xl font-bold text-white">
              {loading ? '...' : formatCurrency(metrics.avgValue.current)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              vs {formatCurrency(metrics.avgValue.previous)} last period
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Over Time</h3>
            <div className="h-64">
              <div className="flex items-end justify-between h-48 space-x-2">
                {revenueData?.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-dark-bg rounded-t-lg relative group">
                      <div
                        className="bg-gradient-to-t from-accent-cyan to-accent-teal rounded-t-lg transition-all group-hover:from-accent-teal group-hover:to-accent-green"
                        style={{
                          height: `${(item.revenue / maxRevenue) * 192}px`,
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">Proposal Pipeline</h3>
            <div className="space-y-4">
              {pipelineData && pipelineData.map((stage: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{stage.stage}</span>
                    <span className="text-sm font-semibold text-white">
                      {stage.count} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-dark-bg rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent-cyan to-accent-teal h-3 rounded-full transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-dark-card rounded-lg border-2 border-accent-cyan">
                <p className="text-base font-semibold text-white">
                  Overall Conversion Rate: 67%
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  28 of 42 proposals sent resulted in signed contracts
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">Job Status Breakdown</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90">
                  {jobStatusData && jobStatusData.map((item: any, index: number) => {
                    const percentage = Number.isFinite(item.count) && Number.isFinite(totalJobs) && totalJobs > 0
                      ? (item.count / totalJobs) * 100
                      : 0;
                    const previousPercentage = jobStatusData
                      .slice(0, index)
                      .reduce((sum: number, i: any) => {
                        const pct = Number.isFinite(i.count) && Number.isFinite(totalJobs) && totalJobs > 0
                          ? (i.count / totalJobs) * 100
                          : 0;
                        return sum + pct;
                      }, 0);
                    const circumference = 2 * Math.PI * 70;
                    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((previousPercentage / 100) * circumference);

                    const colorMap: Record<string, string> = {
                      'bg-gray-400': '#9CA3AF',
                      'bg-blue-500': '#3B82F6',
                      'bg-green-500': '#10B981',
                      'bg-pink-500': '#EC4899',
                      'bg-red-500': '#EF4444',
                      'bg-accent-cyan': '#A855F7',
                    };

                    return (
                      <circle
                        key={index}
                        cx="96"
                        cy="96"
                        r="70"
                        stroke={colorMap[item.color]}
                        strokeWidth="30"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{totalJobs}</p>
                    <p className="text-xs text-gray-400">Total Jobs</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {jobStatusData?.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{item.status}</p>
                    <p className="text-xs text-gray-400">{item.count} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
            <h3 className="text-lg font-bold text-white mb-4">Revenue by Job Type</h3>
            <div className="space-y-4">
              {revenueByType?.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{item.type}</span>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-dark-bg rounded-full h-8 overflow-hidden">
                    <div
                      className={`${item.color} h-8 rounded-full flex items-center justify-end pr-3 transition-all`}
                      style={{ width: `${(item.revenue / maxTypeRevenue) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {Math.round((item.revenue / maxTypeRevenue) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-dark-card rounded-2xl border-2 border-dark-border p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-accent-cyan text-dark-bg rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold mr-3">
              AI
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI-Powered Business Insights</h2>
              <p className="text-sm text-gray-400">
                Recommendations to grow your business
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {insights?.map((insight, index) => (
              <div
                key={index}
                className={`bg-dark-card rounded-xl p-5 border-2 ${
                  insight.impact === 'high'
                    ? 'border-accent-green'
                    : insight.impact === 'medium'
                    ? 'border-accent-cyan'
                    : 'border-dark-border'
                }`}
              >
                <div className="flex items-start mb-3">
                  <span className="text-2xl mr-3">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-2">{insight.category.charAt(0).toUpperCase() + insight.category.slice(1)} Insights</h4>
                    <p className="text-sm text-gray-300 mb-2">{insight.insight}</p>
                    {insight.recommendation && (
                      <div className="mt-3 p-3 bg-accent-cyan/10 rounded-lg">
                        <p className="text-xs font-semibold text-accent-cyan flex items-start">
                          <Lightbulb className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                          {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Goals & Targets</h2>
          <div className="space-y-6">
            {goals?.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              const isOnTrack = progress >= 80;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h4 className="text-sm font-semibold text-white mr-3">
                        {goal.name}
                      </h4>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          isOnTrack
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        } flex items-center`}
                      >
                        {isOnTrack ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {isOnTrack ? 'On Track' : 'Behind Pace'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {goal.unit === '$' && '$'}
                      {goal.current.toLocaleString()}
                      {goal.unit === '%' && '%'} / {goal.unit === '$' && '$'}
                      {goal.target.toLocaleString()}
                      {goal.unit === '%' && '%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        isOnTrack
                          ? 'bg-gradient-to-r from-green-600 to-green-400'
                          : 'bg-gradient-to-r from-orange-600 to-orange-400'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% of goal</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
  );
}
