import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Field, Input } from '../components/Form';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      navigate('/dashboard');
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
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <header className="bg-dark-card border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-white">
              FlashQuote
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <div className="bg-dark-card rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-800">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-400">
                Login to your FlashQuote account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm text-center">
                  Development mode: Click "Login" to enter without credentials
                </p>
              </div>

              <Field label="Email">
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                )}
              </Field>

              <Field label="Password">
                {(id) => (
                  <Input
                    id={id}
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                )}
              </Field>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 bg-[#0F172A] text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(135deg,#3B82F6,#60A5FA)'}}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

          </div>

          <div className="mt-8 bg-dark-card border border-gray-800 rounded-xl p-6 text-center">
            <p className="font-semibold mb-2 text-white">New to FlashQuote?</p>
            <p className="text-gray-400 text-sm mb-4">
              Start your 14-day free trial today. No credit card required.
            </p>
            <Link
              to="/signup"
              className="inline-block text-white px-6 py-2 rounded-lg font-semibold transition-all"
              style={{background: 'linear-gradient(135deg,#10b981,#059669)'}}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-dark-bg border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; 2025 FlashQuote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
