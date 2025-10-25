import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center text-2xl font-bold text-blue-600">
              FlashQuote
            </Link>
            <nav className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white px-6 py-2 rounded-lg transition-all" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                Start Free Trial
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to run your contracting business efficiently
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-600">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">FlashQuote Pro</h2>
              <p className="text-blue-100">Complete business automation</p>
            </div>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-gray-900 mb-3">
                  $99<span className="text-3xl text-gray-600">/month</span>
                </div>
                <div className="text-lg text-gray-600 mb-6">
                  Plus 2.9% transaction fee on paid invoices
                </div>
                <p className="text-sm text-gray-500 max-w-xl mx-auto">
                  Only pay transaction fees when you get paid. No hidden costs, no surprise charges.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Everything included:</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited proposals</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited estimates</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Unlimited invoices</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Automatic follow-ups</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Smart payment reminders</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Customer communication</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">24/7 AI assistant</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Voice and text input</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Mobile app access</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Professional templates</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Payment tracking</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Customer database</span>
                  </div>
                </div>
              </div>

              <Link
                to="/signup"
                className="w-full block text-center text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all mb-4" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                Start Free Trial
              </Link>

              <p className="text-center text-sm text-gray-500">
                No credit card required. Cancel anytime.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  What's included in the free trial?
                </h4>
                <p className="text-gray-600">
                  Full access to all features for 14 days. No credit card required. No automatic charges.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  How do transaction fees work?
                </h4>
                <p className="text-gray-600">
                  You only pay 2.9% when you receive payment through an invoice. If you don't get paid, you don't pay the fee.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-gray-600">
                  Yes, absolutely. No contracts, no commitments. Cancel with one click from your account settings.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a limit on proposals or invoices?
                </h4>
                <p className="text-gray-600">
                  No limits. Create as many proposals, estimates, and invoices as you need. Your AI handles it all.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              &copy; 2025 FlashQuote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
