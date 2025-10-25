import { supabase } from './supabase';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MetricResult {
  current: number;
  previous: number;
  percentChange: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  proposalsSent: number;
  jobsWon: number;
}

export interface PipelineStages {
  created: number;
  sent: number;
  viewed: number;
  signed: number;
}

export interface PipelineConversions {
  createdToSent: number;
  sentToViewed: number;
  viewedToSigned: number;
  overallConversion: number;
}

export interface JobTypeRevenue {
  type: string;
  revenue: number;
  count: number;
  averageValue: number;
}

export interface AIInsight {
  category: string;
  icon: string;
  insight: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

class AnalyticsService {
  private async getContractorId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  private calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getPreviousPeriod(startDate: Date, endDate: Date): DateRange {
    const duration = endDate.getTime() - startDate.getTime();
    return {
      start: new Date(startDate.getTime() - duration),
      end: new Date(startDate.getTime())
    };
  }

  private safeCalculate(fn: () => number, defaultValue: number = 0): number {
    try {
      const result = fn();
      return isNaN(result) || !isFinite(result) ? defaultValue : result;
    } catch (error) {
      console.error('Calculation error:', error);
      return defaultValue;
    }
  }

  async calculateTotalRevenue(startDate: Date, endDate: Date): Promise<MetricResult> {
    const userId = await this.getContractorId();
    if (!userId) return { current: 0, previous: 0, percentChange: 0 };

    const { data: currentInvoices } = await supabase
      .from('invoices')
      .select('total, paid_at')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('paid_at', startDate.toISOString())
      .lte('paid_at', endDate.toISOString());

    const current = currentInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    const { data: previousInvoices } = await supabase
      .from('invoices')
      .select('total')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('paid_at', previousPeriod.start.toISOString())
      .lte('paid_at', previousPeriod.end.toISOString());

    const previous = previousInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

    return {
      current,
      previous,
      percentChange: this.calculatePercentChange(current, previous)
    };
  }

  async calculateJobsCompleted(startDate: Date, endDate: Date): Promise<MetricResult> {
    const userId = await this.getContractorId();
    if (!userId) return { current: 0, previous: 0, percentChange: 0 };

    const { count: current } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString());

    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    const { count: previous } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', previousPeriod.start.toISOString())
      .lte('completed_at', previousPeriod.end.toISOString());

    return {
      current: current || 0,
      previous: previous || 0,
      percentChange: this.calculatePercentChange(current || 0, previous || 0)
    };
  }

  async calculateWinRate(startDate: Date, endDate: Date): Promise<MetricResult> {
    const userId = await this.getContractorId();
    if (!userId) return { current: 0, previous: 0, percentChange: 0 };

    const { data: sentProposals } = await supabase
      .from('jobs')
      .select('status')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .neq('status', 'draft');

    const sent = sentProposals?.length || 0;
    const signed = sentProposals?.filter(j =>
      ['signed', 'in_progress', 'completed', 'paid'].includes(j.status)
    ).length || 0;

    const current = this.safeCalculate(() => (signed / sent) * 100, 0);

    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    const { data: prevProposals } = await supabase
      .from('jobs')
      .select('status')
      .eq('user_id', userId)
      .gte('created_at', previousPeriod.start.toISOString())
      .lte('created_at', previousPeriod.end.toISOString())
      .neq('status', 'draft');

    const prevSent = prevProposals?.length || 0;
    const prevSigned = prevProposals?.filter(j =>
      ['signed', 'in_progress', 'completed', 'paid'].includes(j.status)
    ).length || 0;

    const previous = this.safeCalculate(() => (prevSigned / prevSent) * 100, 0);

    return {
      current,
      previous,
      percentChange: current - previous
    };
  }

  async calculateAverageJobValue(startDate: Date, endDate: Date): Promise<MetricResult> {
    const userId = await this.getContractorId();
    if (!userId) return { current: 0, previous: 0, percentChange: 0 };

    const { data: completedJobs } = await supabase
      .from('jobs')
      .select('price')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString());

    const count = completedJobs?.length || 0;
    const total = completedJobs?.reduce((sum, j) => sum + (j.price || 0), 0) || 0;
    const current = this.safeCalculate(() => total / count, 0);

    const previousPeriod = this.getPreviousPeriod(startDate, endDate);
    const { data: prevJobs } = await supabase
      .from('jobs')
      .select('price')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', previousPeriod.start.toISOString())
      .lte('completed_at', previousPeriod.end.toISOString());

    const prevCount = prevJobs?.length || 0;
    const prevTotal = prevJobs?.reduce((sum, j) => sum + (j.price || 0), 0) || 0;
    const previous = this.safeCalculate(() => prevTotal / prevCount, 0);

    return {
      current,
      previous,
      percentChange: this.calculatePercentChange(current, previous)
    };
  }

  async calculateMonthlyRevenue(months: number = 12): Promise<RevenueDataPoint[]> {
    const userId = await this.getContractorId();
    if (!userId) return [];

    const today = new Date();
    const monthlyData: RevenueDataPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

      const { data: invoices } = await supabase
        .from('invoices')
        .select('total')
        .eq('user_id', userId)
        .eq('status', 'paid')
        .gte('paid_at', monthStart.toISOString())
        .lte('paid_at', monthEnd.toISOString());

      const revenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

      const { count: proposalsSent } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .neq('status', 'draft');

      const { data: wonJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['signed', 'in_progress', 'completed', 'paid'])
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      monthlyData.push({
        date: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        proposalsSent: proposalsSent || 0,
        jobsWon: wonJobs?.length || 0
      });
    }

    return monthlyData;
  }

  async calculateProposalPipeline(startDate: Date, endDate: Date): Promise<{ stages: PipelineStages; conversions: PipelineConversions }> {
    const userId = await this.getContractorId();
    if (!userId) {
      return {
        stages: { created: 0, sent: 0, viewed: 0, signed: 0 },
        conversions: { createdToSent: 0, sentToViewed: 0, viewedToSigned: 0, overallConversion: 0 }
      };
    }

    const { data: allProposals } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const stages: PipelineStages = {
      created: allProposals?.length || 0,
      sent: allProposals?.filter(j => j.status !== 'draft').length || 0,
      viewed: allProposals?.filter(j => j.status === 'viewed' || ['signed', 'in_progress', 'completed'].includes(j.status)).length || 0,
      signed: allProposals?.filter(j => ['signed', 'in_progress', 'completed', 'paid'].includes(j.status)).length || 0
    };

    const conversions: PipelineConversions = {
      createdToSent: this.safeCalculate(() => (stages.sent / stages.created) * 100, 0),
      sentToViewed: this.safeCalculate(() => (stages.viewed / stages.sent) * 100, 0),
      viewedToSigned: this.safeCalculate(() => (stages.signed / stages.viewed) * 100, 0),
      overallConversion: this.safeCalculate(() => (stages.signed / stages.created) * 100, 0)
    };

    return { stages, conversions };
  }

  async calculateJobStatusBreakdown(startDate: Date, endDate: Date): Promise<{ counts: Record<string, number>; percentages: Record<string, number>; total: number }> {
    const userId = await this.getContractorId();
    if (!userId) {
      return { counts: {}, percentages: {}, total: 0 };
    }

    const { data: allJobs } = await supabase
      .from('jobs')
      .select('status')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const statusCounts: Record<string, number> = {
      draft: 0,
      proposalsOut: 0,
      active: 0,
      awaitingPayment: 0,
      completedPaid: 0
    };

    allJobs?.forEach(job => {
      switch (job.status) {
        case 'draft':
          statusCounts.draft++;
          break;
        case 'sent':
        case 'viewed':
          statusCounts.proposalsOut++;
          break;
        case 'signed':
        case 'in_progress':
          statusCounts.active++;
          break;
        case 'completed':
          statusCounts.awaitingPayment++;
          break;
        case 'paid':
          statusCounts.completedPaid++;
          break;
      }
    });

    const total = allJobs?.length || 0;
    const percentages: Record<string, number> = {};

    Object.keys(statusCounts).forEach(key => {
      percentages[key] = this.safeCalculate(() => (statusCounts[key] / total) * 100, 0);
    });

    return { counts: statusCounts, percentages, total };
  }

  private determineJobType(title: string, description: string = ''): string {
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('bathroom')) return 'Bathroom Remodels';
    if (text.includes('kitchen')) return 'Kitchen Remodels';
    if (text.includes('flooring') || text.includes('floor')) return 'Flooring';
    if (text.includes('painting') || text.includes('paint')) return 'Painting';
    if (text.includes('tile') || text.includes('tiling')) return 'Tile Work';
    if (text.includes('deck') || text.includes('patio')) return 'Decks & Patios';
    if (text.includes('basement')) return 'Basement Finishing';
    if (text.includes('roof')) return 'Roofing';
    if (text.includes('electrical') || text.includes('electric')) return 'Electrical';
    if (text.includes('plumbing') || text.includes('plumb')) return 'Plumbing';

    return 'General Repairs';
  }

  async calculateRevenueByJobType(startDate: Date, endDate: Date): Promise<JobTypeRevenue[]> {
    const userId = await this.getContractorId();
    if (!userId) return [];

    const { data: completedJobs } = await supabase
      .from('jobs')
      .select('title, description, price')
      .eq('user_id', userId)
      .in('status', ['completed', 'paid'])
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString());

    const revenueByType: Record<string, { revenue: number; count: number }> = {};

    completedJobs?.forEach(job => {
      const jobType = this.determineJobType(job.title, job.description);

      if (!revenueByType[jobType]) {
        revenueByType[jobType] = { revenue: 0, count: 0 };
      }

      revenueByType[jobType].revenue += job.price || 0;
      revenueByType[jobType].count++;
    });

    const result: JobTypeRevenue[] = Object.entries(revenueByType)
      .map(([type, data]) => ({
        type,
        revenue: data.revenue,
        count: data.count,
        averageValue: this.safeCalculate(() => data.revenue / data.count, 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return result;
  }

  async generateAIInsights(startDate: Date, endDate: Date): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    try {
      const revenueByType = await this.calculateRevenueByJobType(startDate, endDate);
      if (revenueByType.length > 1) {
        const topType = revenueByType[0];
        const totalRevenue = revenueByType.reduce((sum, item) => sum + item.revenue, 0);
        const percentage = this.safeCalculate(() => (topType.revenue / totalRevenue) * 100, 0);

        if (percentage > 30) {
          insights.push({
            category: 'revenue',
            icon: '📊',
            insight: `${topType.type} generate ${percentage.toFixed(0)}% of your revenue`,
            recommendation: `Focus marketing efforts on ${topType.type} projects`,
            impact: 'high'
          });
        }
      }

      const winRate = await this.calculateWinRate(startDate, endDate);
      if (winRate.current > 60) {
        insights.push({
          category: 'sales',
          icon: '🎯',
          insight: `Your ${winRate.current.toFixed(0)}% win rate is above industry average of 52%`,
          recommendation: 'Keep up the great work with proposals!',
          impact: 'medium'
        });
      } else if (winRate.current < 40) {
        insights.push({
          category: 'sales',
          icon: '💡',
          insight: `Your win rate of ${winRate.current.toFixed(0)}% could be improved`,
          recommendation: 'Consider following up faster or adjusting pricing',
          impact: 'high'
        });
      }

      const avgJobValue = await this.calculateAverageJobValue(startDate, endDate);
      if (avgJobValue.percentChange > 15) {
        insights.push({
          category: 'pricing',
          icon: '💰',
          insight: `Average job value increased ${avgJobValue.percentChange.toFixed(0)}% this period`,
          recommendation: 'Your pricing strategy is working well',
          impact: 'high'
        });
      }

      const pipeline = await this.calculateProposalPipeline(startDate, endDate);
      if (pipeline.conversions.viewedToSigned < 50 && pipeline.stages.viewed > 5) {
        insights.push({
          category: 'timing',
          icon: '⏱️',
          insight: `Only ${pipeline.conversions.viewedToSigned.toFixed(0)}% of viewed proposals are signed`,
          recommendation: 'Follow up within 24 hours of proposal views',
          impact: 'high'
        });
      }

      const revenue = await this.calculateTotalRevenue(startDate, endDate);
      if (revenue.percentChange > 20) {
        insights.push({
          category: 'growth',
          icon: '🚀',
          insight: `Revenue grew ${revenue.percentChange.toFixed(0)}% compared to last period`,
          recommendation: 'Great momentum! Consider hiring help to scale',
          impact: 'high'
        });
      }

    } catch (error) {
      console.error('Error generating insights:', error);
    }

    if (insights.length === 0) {
      insights.push({
        category: 'general',
        icon: '📈',
        insight: 'Keep tracking your metrics to unlock personalized insights',
        recommendation: 'Complete more jobs to see detailed analytics',
        impact: 'medium'
      });
    }

    return insights;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  formatPercentChange(change: number): { text: string; color: string; arrow: string } {
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    const color = change > 0 ? 'green' : change < 0 ? 'red' : 'gray';
    return {
      text: `${arrow} ${Math.abs(change).toFixed(1)}%`,
      color,
      arrow
    };
  }
}

export const analyticsService = new AnalyticsService();
