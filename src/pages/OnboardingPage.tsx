import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type OnboardingStep = 1 | 2 | 3;

interface OnboardingData {
  tradeType: string;
  yearsInBusiness: string;
  teamSize: string;
  annualRevenueRange: string;
  serviceAreaZipcode: string;
  hourlyRate: string;
  materialMarkupPercentage: string;
  paymentTerms: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    tradeType: '',
    yearsInBusiness: '',
    teamSize: '',
    annualRevenueRange: '',
    serviceAreaZipcode: '',
    hourlyRate: '',
    materialMarkupPercentage: '',
    paymentTerms: 'Net 30',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await updateProfile({
        trade_type: formData.tradeType,
        years_in_business: formData.yearsInBusiness,
        team_size: formData.teamSize,
        annual_revenue_range: formData.annualRevenueRange || undefined,
        service_area_zipcode: formData.serviceAreaZipcode,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        material_markup_percentage: formData.materialMarkupPercentage
          ? parseFloat(formData.materialMarkupPercentage)
          : undefined,
        payment_terms: formData.paymentTerms,
        onboarding_completed: true,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.tradeType !== '';
  const isStep2Valid =
    formData.yearsInBusiness !== '' &&
    formData.teamSize !== '' &&
    formData.serviceAreaZipcode !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-blue-600">FlashQuote</span>
            <div className="text-sm text-gray-600">
              Step {currentStep} of 3
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  style={currentStep >= step ? {background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'} : {}}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      currentStep > step ? '' : 'bg-gray-200'
                    }`}
                    style={currentStep > step ? {background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'} : {}}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    What type of contractor are you?
                  </h2>
                  <p className="text-gray-600">
                    Select the trade that best describes your business
                  </p>
                </div>

                <div>
                  <label htmlFor="tradeType" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Trade
                  </label>
                  <select
                    id="tradeType"
                    name="tradeType"
                    value={formData.tradeType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-base"
                  >
                    <option value="">Choose a trade...</option>
                    <option value="remodeling">Remodeling & Renovations (Recommended - Most Popular)</option>
                    <option value="bathroom">Bathroom Remodeling</option>
                    <option value="kitchen">Kitchen Remodeling</option>
                    <option value="handyman">General Handyman</option>
                    <option value="painting">Painting</option>
                    <option value="flooring">Flooring & Tile</option>
                    <option value="other">Other (Coming Soon - Request Your Trade)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="flex items-center text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)')} onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)')}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Tell us about your business
                  </h2>
                  <p className="text-gray-600">
                    This helps us customize your experience
                  </p>
                </div>

                <div>
                  <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business
                  </label>
                  <select
                    id="yearsInBusiness"
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="<1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    id="teamSize"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="Solo">Solo</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11+">11+ people</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="annualRevenueRange" className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue Range <span className="text-gray-500">(Optional)</span>
                  </label>
                  <select
                    id="annualRevenueRange"
                    name="annualRevenueRange"
                    value={formData.annualRevenueRange}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="<50k">Less than $50,000</option>
                    <option value="50k-100k">$50,000 - $100,000</option>
                    <option value="100k-250k">$100,000 - $250,000</option>
                    <option value="250k-500k">$250,000 - $500,000</option>
                    <option value="500k+">$500,000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="serviceAreaZipcode" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Area (Zip Code)
                  </label>
                  <input
                    type="text"
                    id="serviceAreaZipcode"
                    name="serviceAreaZipcode"
                    value={formData.serviceAreaZipcode}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{5}"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="12345"
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep2Valid}
                    className="flex items-center text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)')} onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)')}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Let's set up your pricing
                  </h2>
                  <p className="text-gray-600">
                    You can always adjust these later
                  </p>
                </div>

                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Average Hourly Rate <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-3 text-gray-500">/hour</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="materialMarkupPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Typical Markup on Materials <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="materialMarkupPercentage"
                      name="materialMarkupPercentage"
                      value={formData.materialMarkupPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="1"
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 text-lg">%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Payment Terms
                  </label>
                  <select
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  >
                    <option value="Due on receipt">Due on receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)')} onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)')}
                  >
                    {loading ? 'Completing...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
