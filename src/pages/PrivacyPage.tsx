import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
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
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-600">Last updated: October 16, 2024</p>
              </div>
            </div>

            <div className="prose prose-blue max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  FlashQuote ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Business information (company name, address)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Customer data you input into the system</li>
                  <li>Job details, proposals, and invoices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Generate AI-powered insights and recommendations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-700 leading-relaxed">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                  <li>Service providers who perform services on our behalf</li>
                  <li>Professional advisors, such as lawyers and accountants</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing of your information</li>
                  <li>Export your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                  <br />
                  <span className="font-semibold">privacy@flashquote.com</span>
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
