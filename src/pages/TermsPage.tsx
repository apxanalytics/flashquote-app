import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            FlashQuote
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
            <div className="flex items-center mb-8">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-600">Last updated: October 16, 2024</p>
              </div>
            </div>

            <div className="prose prose-blue max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using FlashQuote, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  FlashQuote grants you a personal, non-transferable, non-exclusive license to use the service, subject to these terms.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">You may not:</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Modify or copy the service materials</li>
                  <li>Use the service for any commercial purpose without authorization</li>
                  <li>Attempt to decompile or reverse engineer the service</li>
                  <li>Remove any copyright or proprietary notations</li>
                  <li>Transfer the service to another person</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription and Payment</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Billing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Subscriptions are billed monthly or annually in advance. You agree to pay all fees associated with your chosen subscription plan.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cancellation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. No refunds are provided for partial months.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Changes</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to change our pricing with 30 days notice to existing subscribers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Maintaining the security of your account credentials</li>
                  <li>All activity that occurs under your account</li>
                  <li>Ensuring your use of the service complies with applicable laws</li>
                  <li>The accuracy of information you provide</li>
                  <li>Backing up your own data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Availability</h2>
                <p className="text-gray-700 leading-relaxed">
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted access to the service. We may perform maintenance that temporarily interrupts service with reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  FlashQuote shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  For questions about these Terms, please contact us at:
                  <br />
                  <span className="font-semibold">legal@flashquote.com</span>
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
