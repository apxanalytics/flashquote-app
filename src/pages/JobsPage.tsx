import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, ChevronDown, FileText } from 'lucide-react';
import type { Job } from '../lib/api';
import { fn, authHeaders, fetchJSON } from '../lib/http';

type FilterStatus = 'all' | 'draft' | 'sent' | 'viewed' | 'signed' | 'in_progress' | 'completed';
type SortOption = 'newest' | 'oldest' | 'highest' | 'name';

type JobWithCustomer = Job & {
  customer?: { name?: string } | null;
};

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [focusedJobId, setFocusedJobId] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const focusParam = searchParams.get('focus');

    if (statusParam === 'sent') {
      setFilterStatus('sent');
    } else if (statusParam === 'signed') {
      setFilterStatus('signed');
    } else if (statusParam && ['all', 'draft', 'viewed', 'in_progress', 'completed'].includes(statusParam)) {
      setFilterStatus(statusParam as FilterStatus);
    }

    if (focusParam) {
      setFocusedJobId(focusParam);
      setTimeout(() => {
        const element = document.getElementById(`job-${focusParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    loadJobs();
  }, [filterStatus]);

  async function loadJobs() {
    setIsLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const q = new URLSearchParams();
      if (filterStatus !== 'all') q.set('status', filterStatus);

      const url = fn('list-jobs') + '?' + q.toString();
      const { jobs } = await fetchJSON(url, { headers });
      setJobs(jobs || []);
    } catch (err: any) {
      if (/Not authenticated/i.test(err.message)) {
        setError('Please sign in to view your jobs.');
      } else {
        setError(err.message || 'Failed to load jobs');
      }
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const isJobInProgress = (jobId: string): boolean => {
    return false;
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (filterStatus === 'draft') {
      filtered = filtered.filter((job) => job.status === 'draft');
    } else if (filterStatus === 'sent') {
      filtered = filtered.filter((job) => job.status === 'sent' || job.status === 'viewed');
    } else if (filterStatus === 'viewed') {
      filtered = filtered.filter((job) => job.status === 'viewed');
    } else if (filterStatus === 'signed') {
      filtered = filtered.filter((job) => job.status === 'signed');
    } else if (filterStatus === 'in_progress') {
      filtered = filtered.filter((job) => isJobInProgress(job.id));
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter((job) => job.status === 'completed' || job.status === 'paid');
    }

    if (searchQuery) {
      filtered = filtered.filter((job) => {
        const query = searchQuery.toLowerCase();
        const customerName = job.customer?.name || '';
        return (
          (job.title || '').toLowerCase().includes(query) ||
          customerName.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  };

  const sortJobs = (jobsToSort: typeof jobs) => {
    const sorted = [...jobsToSort];

    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'highest':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name':
        return sorted.sort((a, b) => {
          const aName = a.customer?.name || 'No customer yet';
          const bName = b.customer?.name || 'No customer yet';
          return aName.localeCompare(bName);
        });
      default:
        return sorted;
    }
  };

  const getStatusCount = (status: FilterStatus): number => {
    if (status === 'all') return jobs.length;
    if (status === 'draft') return jobs.filter((j) => j.status === 'draft').length;
    if (status === 'sent') return jobs.filter((j) => j.status === 'sent' || j.status === 'viewed').length;
    if (status === 'viewed') return jobs.filter((j) => j.status === 'viewed').length;
    if (status === 'signed') return jobs.filter((j) => j.status === 'signed').length;
    if (status === 'in_progress') return jobs.filter((j) => isJobInProgress(j.id)).length;
    if (status === 'completed') return jobs.filter((j) => j.status === 'completed' || j.status === 'paid').length;
    return 0;
  };

  const filteredAndSortedJobs = sortJobs(filterJobs());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Jobs</h1>
          <p className="text-gray-400 mt-1">Track proposals, active jobs, and completed work</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {jobs.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No jobs yet</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
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
                    <option value="viewed">Viewed ({getStatusCount('viewed')})</option>
                    <option value="signed">Signed ({getStatusCount('signed')})</option>
                    <option value="in_progress">In Progress ({getStatusCount('in_progress')})</option>
                    <option value="completed">Completed ({getStatusCount('completed')})</option>
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
                    <option value="highest">Highest Value</option>
                    <option value="name">Customer Name</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {filteredAndSortedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No jobs match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="mt-4 text-accent-cyan hover:text-accent-teal"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAndSortedJobs.map((job) => (
                  <div
                    key={job.id}
                    id={`job-${job.id}`}
                    className={focusedJobId === job.id ? 'ring-2 ring-accent-cyan rounded-lg' : ''}
                  >
                    <JobCard job={job} onClick={() => navigate(`/dashboard/jobs/${job.id}`)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
    </div>
  );
}
