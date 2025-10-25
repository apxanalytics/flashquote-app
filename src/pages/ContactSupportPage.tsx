import { useState } from 'react';
import { Mail, Phone, Clock, ArrowLeft, Paperclip, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to submit a support ticket');
        setSubmitting(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `/functions/v1/submit-support-ticket`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            subject: formData.subject,
            category: formData.category,
            message: formData.message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit ticket');
      }

      setSubmitted(true);
      setFormData({ subject: '', category: '', message: '' });
    } catch (err: any) {
      console.error('Error submitting support ticket:', err);
      setError(err.message || 'Failed to submit support ticket. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
              <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center bg-white rounded-2xl shadow-lg border-2 border-green-200 p-12">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h2>
            <p className="text-lg text-gray-600 mb-6">
              We've received your support request and will respond within 4 hours during business days (Mon-Fri, 9am-6pm CT).
            </p>
            <p className="text-gray-500 mb-8">
              We've also sent a confirmation to your email.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Send Another Message
              </button>
              <Link
                to="/dashboard/help"
                className="text-white px-6 py-3 rounded-lg transition-all font-semibold" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                Back to Help Center
              </Link>
            </div>
          </div>
        </div>
    );
  }

  return (
          <div className="max-w-4xl mx-auto px-4 pb-12">
        <Link
          to="/dashboard/help"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Contact Support
          </h1>
          <p className="text-xl text-gray-600">
            We're here to help! We typically respond within 4 hours during business days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-600 transition-all">
            <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-center">Email</h3>
            <a
              href="mailto:support@flashquote.com"
              className="text-sm text-blue-600 hover:underline block text-center mb-3"
            >
              support@flashquote.com
            </a>
            <p className="text-xs text-gray-500 text-center">Response within 4 hours</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-green-600 transition-all">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-center">Text Support</h3>
            <a
              href="sms:+18001234567"
              className="text-sm text-green-600 hover:underline block text-center mb-3"
            >
              1-800-123-4567
            </a>
            <p className="text-xs text-gray-500 text-center">Text us anytime</p>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-600 transition-all">
            <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-center">Phone</h3>
            <p className="text-sm text-gray-600 mb-3 text-center">Schedule a call</p>
            <p className="text-xs text-gray-500 text-center">Mon-Fri, 9am-6pm CT</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Support Request</h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select a category...</option>
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Report a Bug</option>
                <option value="account">Account Help</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Please provide as much detail as possible about your issue or question..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[200px] resize-y"
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Include relevant details like what you were trying to do, error messages, and steps to reproduce.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Screenshot (Optional)
              </label>
              <button
                type="button"
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border-2 border-gray-300"
              >
                <Paperclip className="w-5 h-5 mr-2" />
                Attach File
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, PDF (max 10MB)
              </p>
            </div>

            <div className="pt-4 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full text-white px-6 py-4 rounded-lg transition-all font-semibold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)')} onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)')}
              >
                {submitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3">Before You Contact Us</h3>
            <p className="text-sm text-gray-600 mb-4">
              You might find your answer faster in these resources:
            </p>
            <div className="space-y-2">
              <Link
                to="/dashboard/help/faqs"
                className="block text-blue-600 hover:underline text-sm font-medium"
              >
                → Frequently Asked Questions
              </Link>
              <Link
                to="/dashboard/help/videos"
                className="block text-blue-600 hover:underline text-sm font-medium"
              >
                → Video Tutorials
              </Link>
              <Link
                to="/dashboard/help/getting-started"
                className="block text-blue-600 hover:underline text-sm font-medium"
              >
                → Getting Started Guide
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="font-bold text-gray-900 mb-3">Response Times</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Critical issues:</strong> Within 1 hour</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>General support:</strong> Within 4 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span><strong>Feature requests:</strong> Within 1 business day</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Business days: Monday - Friday, 9am-6pm Central Time
            </p>
          </div>
        </div>
      </div>
  );
}
