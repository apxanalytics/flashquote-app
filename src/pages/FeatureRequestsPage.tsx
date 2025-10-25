import { useState } from 'react';
import { ThumbsUp, Plus, ArrowLeft, Wrench, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Feature {
  id: number;
  title: string;
  description: string;
  votes: number;
  status: 'in-development' | 'planned' | 'consideration';
  category: string;
}

export default function FeatureRequestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [votedFeatures, setVotedFeatures] = useState<Set<number>>(new Set());

  const [features, setFeatures] = useState<Feature[]>([
    {
      id: 1,
      title: 'Material Cost Database',
      description: 'Built-in database of common materials with current pricing to speed up estimates',
      votes: 247,
      status: 'in-development',
      category: 'Estimating',
    },
    {
      id: 2,
      title: 'Team Member Accounts',
      description: 'Add crew members with limited permissions to update job status',
      votes: 189,
      status: 'in-development',
      category: 'Collaboration',
    },
    {
      id: 3,
      title: 'QuickBooks Integration',
      description: 'Sync invoices and payments with QuickBooks automatically',
      votes: 156,
      status: 'in-development',
      category: 'Integrations',
    },
    {
      id: 4,
      title: 'Photo Annotations',
      description: 'Draw on job site photos to highlight problem areas in proposals',
      votes: 134,
      status: 'planned',
      category: 'Proposals',
    },
    {
      id: 5,
      title: 'Recurring Jobs/Maintenance',
      description: 'Schedule and auto-invoice recurring maintenance contracts',
      votes: 128,
      status: 'planned',
      category: 'Jobs',
    },
    {
      id: 6,
      title: 'Custom Proposal Themes',
      description: 'Upload custom fonts, colors, and branding for proposals',
      votes: 115,
      status: 'planned',
      category: 'Customization',
    },
    {
      id: 7,
      title: 'Job Progress Photos',
      description: 'Take photos during the job and share with customers automatically',
      votes: 103,
      status: 'planned',
      category: 'Customer Experience',
    },
    {
      id: 8,
      title: 'Expense Tracking',
      description: 'Track material purchases and labor costs per job for profit analysis',
      votes: 98,
      status: 'planned',
      category: 'Financial',
    },
    {
      id: 9,
      title: 'Video Proposals',
      description: 'Record a video walkthrough and embed it in proposals',
      votes: 87,
      status: 'planned',
      category: 'Proposals',
    },
    {
      id: 10,
      title: 'Calendar View',
      description: 'Visual calendar showing scheduled jobs and available time slots',
      votes: 76,
      status: 'planned',
      category: 'Scheduling',
    },
    {
      id: 11,
      title: 'Subcontractor Management',
      description: 'Track and pay subcontractors with automatic 1099 reporting',
      votes: 71,
      status: 'consideration',
      category: 'Financial',
    },
    {
      id: 12,
      title: 'Multiple Business Profiles',
      description: 'Manage multiple brands/businesses under one account',
      votes: 64,
      status: 'consideration',
      category: 'Account',
    },
  ]);

  const handleVote = (id: number) => {
    if (votedFeatures.has(id)) {
      setVotedFeatures((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setFeatures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, votes: f.votes - 1 } : f))
      );
    } else {
      setVotedFeatures((prev) => new Set(prev).add(id));
      setFeatures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, votes: f.votes + 1 } : f))
      );
    }
  };

  const handleSubmitFeature = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setNewFeatureTitle('');
    setNewFeatureDescription('');
    alert('Thank you for your suggestion! We\'ll review it and add it to the roadmap.');
  };

  const getStatusConfig = (status: Feature['status']) => {
    switch (status) {
      case 'in-development':
        return {
          label: 'In Development',
          icon: Wrench,
          color: 'blue',
          bgColor: 'bg-emerald-100',
          textColor: 'text-blue-700',
        };
      case 'planned':
        return {
          label: 'Planned',
          icon: Clock,
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
        };
      case 'consideration':
        return {
          label: 'Under Consideration',
          icon: CheckCircle,
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
        };
    }
  };

  const groupedFeatures = {
    'in-development': features.filter((f) => f.status === 'in-development'),
    planned: features.filter((f) => f.status === 'planned'),
    consideration: features.filter((f) => f.status === 'consideration'),
  };

  return (
          <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard/help"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Requests & Roadmap</h1>
            <p className="text-lg text-gray-600">
              Vote on features you'd like to see and submit your own ideas
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-white px-6 py-3 rounded-lg transition-all font-semibold flex items-center" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
          >
            <Plus className="w-5 h-5 mr-2" />
            Submit Idea
          </button>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedFeatures).map(([status, featureList]) => {
            const config = getStatusConfig(status as Feature['status']);
            const Icon = config.icon;

            return (
              <div key={status}>
                <div className="flex items-center mb-4">
                  <div className={`${config.bgColor} rounded-lg p-2 mr-3`}>
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {config.label} ({featureList.length})
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {featureList
                    .sort((a, b) => b.votes - a.votes)
                    .map((feature) => (
                      <div
                        key={feature.id}
                        className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-blue-500 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded mb-2">
                              {feature.category}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                              {feature.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleVote(feature.id)}
                            className={`flex-shrink-0 ml-4 flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                              votedFeatures.has(feature.id)
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={votedFeatures.has(feature.id) ? {background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'} : {}}
                          >
                            <ThumbsUp
                              className={`w-5 h-5 ${
                                votedFeatures.has(feature.id) ? 'fill-current' : ''
                              }`}
                            />
                            <span className="text-sm font-bold mt-1">
                              {feature.votes}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl p-8 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Have an Idea?</h3>
          <p className="text-gray-700 mb-4">
            We love hearing from our users! Submit your feature ideas and vote on others.
            Popular requests get prioritized in our development roadmap.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-white px-6 py-2 rounded-lg transition-all font-semibold" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
          >
            Submit Feature Request
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Submit Feature Request
              </h2>

              <form onSubmit={handleSubmitFeature} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Title *
                  </label>
                  <input
                    type="text"
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                    required
                    placeholder="e.g., GPS Tracking for Crew Vehicles"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newFeatureDescription}
                    onChange={(e) => setNewFeatureDescription(e.target.value)}
                    required
                    placeholder="Describe the feature and how it would help your business..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[150px]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
