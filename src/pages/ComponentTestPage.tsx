import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import {
  FileText,
  Mic,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Send,
} from 'lucide-react';

export default function ComponentTestPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
          <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Component Testing Page</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Buttons</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  Primary Button
                </button>
                <button className="bg-white text-emerald-600 border-2 border-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Secondary Button
                </button>
                <button className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                  Gray Button
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Success Button
                </button>
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Danger Button
                </button>
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Disabled Button
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Toast Notifications</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => showToast('This is a success message!', 'success')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Show Success
                </button>
                <button
                  onClick={() => showToast('This is an error message!', 'error')}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Show Error
                </button>
                <button
                  onClick={() => showToast('This is an info message!', 'info')}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Show Info
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading States</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-8 mb-6">
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-gray-600 mt-2">Small</span>
                </div>
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="md" />
                  <span className="text-sm text-gray-600 mt-2">Medium</span>
                </div>
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="lg" />
                  <span className="text-sm text-gray-600 mt-2">Large</span>
                </div>
              </div>
              <button
                onClick={handleLoadingDemo}
                disabled={isLoading}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {isLoading ? 'Loading...' : 'Test Loading Button'}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Empty States</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <EmptyState
                icon={Mic}
                title="No jobs yet"
                description="Create your first job to see it here"
                actionLabel="Start New Job"
                actionLink="/dashboard/new-job"
                secondaryLabel="Learn More"
                secondaryLink="/dashboard/help"
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-100 rounded-lg p-3">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex items-center text-sm font-semibold text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    12%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Open Proposals</h3>
                <p className="text-3xl font-bold text-gray-900">8</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex items-center text-sm font-semibold text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    23%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Won This Month</h3>
                <p className="text-3xl font-bold text-gray-900">$12,500</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 rounded-lg p-3">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex items-center text-sm font-semibold text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    8%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Invoices</h3>
                <p className="text-3xl font-bold text-gray-900">$8,400</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-100 rounded-lg p-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex items-center text-sm font-semibold text-red-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    5%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Overdue</h3>
                <p className="text-3xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Elements</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Input <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Dropdown
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:outline-none transition-colors">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Error State
                  </label>
                  <input
                    type="text"
                    placeholder="Invalid input"
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
                  />
                  <p className="text-sm text-red-600 mt-1">This field is required</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Textarea
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter description..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-600 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Icons & Colors</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                  { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                  { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
                  { icon: Mic, color: 'text-orange-600', bg: 'bg-orange-100' },
                  { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
                  { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
                  { icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                  { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`${item.bg} rounded-lg p-4`}>
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsive Breakpoints</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-2 font-mono text-sm">
                <p className="text-green-600 sm:text-emerald-600 md:text-purple-600 lg:text-orange-600 xl:text-red-600">
                  <span className="inline sm:hidden">Mobile: &lt; 640px (green)</span>
                  <span className="hidden sm:inline md:hidden">SM: ≥ 640px (blue)</span>
                  <span className="hidden md:inline lg:hidden">MD: ≥ 768px (purple)</span>
                  <span className="hidden lg:inline xl:hidden">LG: ≥ 1024px (orange)</span>
                  <span className="hidden xl:inline">XL: ≥ 1280px (red)</span>
                </p>
                <p className="text-gray-600">
                  Current width: {window.innerWidth}px
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
  );
}
