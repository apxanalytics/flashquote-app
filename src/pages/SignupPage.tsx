import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Field, Input } from '../components/Form';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        business_name: formData.businessName,
        owner_name: formData.ownerName,
        phone_number: formData.phoneNumber,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              FlashQuote
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Start Your Free Trial
              </h1>
              <p className="text-gray-600">
                No credit card required. Cancel anytime.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Business Name">
                {(id) => (
                  <Input
                    id={id}
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    autoComplete="organization"
                    placeholder="Smith Contracting"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                )}
              </Field>

              <Field label="Owner Name">
                {(id) => (
                  <Input
                    id={id}
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="John Smith"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                )}
              </Field>

              <Field label="Email Address">
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                )}
              </Field>

              <Field label="Phone Number">
                {(id) => (
                  <Input
                    id={id}
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                )}
              </Field>

              <Field label="Password" hint="At least 8 characters">
                {(id) => (
                  <Input
                    id={id}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                )}
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(135deg,#3B82F6,#60A5FA)'}}
              >
                {loading ? 'Creating Account...' : 'Start Free Trial'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">14-day free trial includes:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
              <span className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                Unlimited Proposals
              </span>
              <span className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                AI Assistant
              </span>
              <span className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                Smart Invoicing
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 FlashQuote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
