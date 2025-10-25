import { Link } from 'react-router-dom';
import { Clock, MessageSquare, FileText, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">FlashQuote</span>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link
                to="/login"
                className="text-white px-6 py-2 rounded-lg font-semibold transition-all" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                Login
              </Link>
            </nav>
            <div className="md:hidden">
              <Link
                to="/login"
                className="text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-dark-bg py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Talk To Your Phone.<br />
              <span className="text-accent-cyan">AI Runs Your Business.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              The AI Advantage for Builders & Remodelers
            </p>
            <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto">
              Create proposals, send invoices, get paid—all by voice. No office. No paperwork. Just $99/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/signup"
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-blue-600"
              >
                View Pricing
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mt-16">
              <div className="bg-dark-card rounded-xl p-6 shadow-lg border-2 border-accent-cyan">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">10-Minute Proposals</h3>
                <p className="text-gray-300 font-semibold mb-1">Walk. Talk. Done.</p>
              </div>

              <div className="bg-dark-card rounded-xl p-6 shadow-lg border-2 border-accent-cyan">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Does The Follow-Ups</h3>
                <p className="text-gray-300 font-semibold mb-1">Never Chase Customers</p>
              </div>

              <div className="bg-dark-card rounded-xl p-6 shadow-lg border-2 border-accent-cyan">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-bold text-white mb-2">Get Paid 3x Faster</h3>
                <p className="text-gray-300 font-semibold mb-1">12 Days vs 45 Days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-colors">
              <div className="bg-accent-cyan/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-accent-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Voice-to-Proposal Technology</h3>
              <p className="text-gray-600 leading-relaxed">
                Walk the site talking to your AI assistant. Get a professional proposal sent to the customer before you leave the property.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-colors">
              <div className="bg-accent-cyan/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-accent-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Set-It-and-Forget-It Communication</h3>
              <p className="text-gray-600 leading-relaxed">
                Your AI handles all customer communication. Follow-ups, reminders, and updates sent automatically so you never lose a lead.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-colors">
              <div className="bg-accent-cyan/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-accent-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accelerated Payment Collection</h3>
              <p className="text-gray-600 leading-relaxed">
                AI creates professional invoices instantly and automatically follows up on payments. Get paid faster without the hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to transform your contracting business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="bg-accent-cyan text-dark-bg w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-4">No Desktop Required</h3>
              <p className="text-gray-300 leading-relaxed">
                Works entirely on your phone. No laptop, no tablet, no office. Generate proposals right at the job site before you leave.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-cyan text-dark-bg w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Zero Data Entry</h3>
              <p className="text-gray-300 leading-relaxed">
                Just talk. No forms to fill out, no measurements to type, no templates to customize. AI extracts everything from your voice.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-cyan text-dark-bg w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Truly Hands-Free</h3>
              <p className="text-gray-300 leading-relaxed">
                AI sends proposals, follows up with customers, and chases payments automatically. You literally never think about it again.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-bg rounded-2xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-100">
                Everything you need to run your business
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent-cyan to-accent-teal rounded-xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  $99<span className="text-2xl text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">+ 2.9% transaction fees</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited proposals and estimates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automatic follow-ups and reminders</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Smart invoicing and payment tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">24/7 AI assistant via phone or text</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Customer communication management</span>
                </li>
              </ul>

              <Link
                to="/signup"
                className="w-full block text-center text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
              >
                Start Free Trial
              </Link>
            </div>

            <p className="text-center text-sm text-gray-100">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-dark-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of contractors who've ditched the paperwork
          </p>
          <Link
            to="/signup"
            className="inline-block text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
