import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { markBusinessProfileComplete } from '../lib/userProgress';
import PriceBookTab from '../components/PriceBookTab';
import DecimalInput from '../components/DecimalInput';
import {
  Building2,
  DollarSign,
  Bot,
  Bell,
  CreditCard,
  FileText,
  User,
  Upload,
  Check,
  HelpCircle,
  Download,
  Trash2,
  Mic,
  Smartphone,
  LogOut,
  Shield,
} from 'lucide-react';

type SettingsTab =
  | 'profile'
  | 'pricing'
  | 'pricebook'
  | 'ai'
  | 'notifications'
  | 'payment'
  | 'templates'
  | 'account';

export default function SettingsPage() {
  const { profile, user, isInstalled, signOutAllDevices } = useAuth();
  const { refreshData, isDemoMode, toggleDemoMode } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const [businessName, setBusinessName] = useState(profile?.business_name || '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name || '');
  const [phone, setPhone] = useState(profile?.business_phone || '');
  const [email, setEmail] = useState(profile?.business_email || '');
  const [website, setWebsite] = useState(profile?.business_website || '');
  const [address, setAddress] = useState(profile?.business_address || '');
  const [licenseNumber, setLicenseNumber] = useState(profile?.license_number || '');
  const [insuranceProvider, setInsuranceProvider] = useState(profile?.insurance_provider || '');
  const [policyNumber, setPolicyNumber] = useState(profile?.insurance_policy_number || '');
  const [expirationDate, setExpirationDate] = useState(profile?.insurance_expiration || '');
  const [serviceRadius, setServiceRadius] = useState(100);

  const [hourlyRate, setHourlyRate] = useState(85);
  const [materialMarkup, setMaterialMarkup] = useState(20);
  const [travelFee, setTravelFee] = useState(50);
  const [emergencyRate, setEmergencyRate] = useState(125);
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [depositRequired, setDepositRequired] = useState(true);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [lateFeePercentage, setLateFeePercentage] = useState(2);
  const [lateFeeDays, setLateFeeDays] = useState(10);
  const [applySalesTax, setApplySalesTax] = useState(true);
  const [taxRate, setTaxRate] = useState(8.5);
  const [taxId, setTaxId] = useState('12-3456789');

  const [aiStyle, setAiStyle] = useState('professional');
  const [responseSpeed, setResponseSpeed] = useState('1-hour');
  const [followUpStyle, setFollowUpStyle] = useState('normal');
  const [autoSendProposals, setAutoSendProposals] = useState(false);
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [followUpDays, setFollowUpDays] = useState(3);
  const [autoSendInvoices, setAutoSendInvoices] = useState(true);
  const [autoPaymentReminders, setAutoPaymentReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [aiLearning, setAiLearning] = useState(true);
  const [suggestPricing, setSuggestPricing] = useState(true);
  const [aiConfidence, setAiConfidence] = useState('medium');

  const [voiceModel, setVoiceModel] = useState('whisper-1');
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [autoPunctuation, setAutoPunctuation] = useState(true);
  const [audioQuality, setAudioQuality] = useState('standard');
  const [deleteAudioAfter, setDeleteAudioAfter] = useState(true);
  const [customVocabulary, setCustomVocabulary] = useState('');

  const [emailNotifs, setEmailNotifs] = useState({
    proposalSigned: true,
    paymentReceived: true,
    invoiceOverdue: true,
    proposalViewed: true,
    aiFollowUp: false,
    dailySummary: true,
  });

  const [smsNotifs, setSmsNotifs] = useState({
    paymentReceived: true,
    proposalSigned: true,
    urgentOverdue: true,
  });

  const [acceptedPayments, setAcceptedPayments] = useState({
    card: true,
    ach: true,
    cash: true,
    check: true,
  });
  const [passFees, setPassFees] = useState(false);
  const [convenienceFee, setConvenienceFee] = useState(3);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (user && activeTab === 'profile') {
      const hasRequiredFields = businessName && ownerName && phone;
      if (hasRequiredFields) {
        await markBusinessProfileComplete(user.id).catch(console.error);
      }
    }
  };

  const handleSeedDatabase = async () => {
    showToast('Demo data feature has been removed', 'error');
  };

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'pricing', label: 'Pricing & Terms', icon: DollarSign },
    { id: 'pricebook', label: 'Price Book', icon: FileText },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'account', label: 'Account & Billing', icon: User },
  ] as const;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your business configuration and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-2 lg:sticky lg:top-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left transition-all duration-150 ${
                        activeTab === tab.id
                          ? 'rounded-lg text-white shadow-[0_0_8px_rgba(59,130,246,.45)] bg-[linear-gradient(135deg,#3B82F6,#60A5FA)]'
                          : 'rounded-lg text-slate-300 hover:text-white hover:shadow-[0_0_6px_rgba(59,130,246,.45)] hover:bg-[#1E293B] focus:shadow-[0_0_8px_rgba(59,130,246,.6)] focus:outline-none'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className={activeTab === tab.id ? '' : 'text-sm'}>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Business Profile</h2>
                    <p className="text-gray-400 mb-6">
                      This information appears on your proposals and invoices
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">Business Logo</h3>
                    <div className="flex items-start space-x-4">
                      <div className="w-32 h-32 bg-dark-bg rounded-lg border-2 border-dashed border-dark-border flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <button className="text-white px-4 py-2 rounded-lg transition-all text-sm font-medium" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}>
                          Upload Logo
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: 200x200px, PNG or JPG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Owner/Contact Name *
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">License & Insurance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          value={insuranceProvider}
                          onChange={(e) => setInsuranceProvider(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Policy Number
                        </label>
                        <input
                          type="text"
                          value={policyNumber}
                          onChange={(e) => setPolicyNumber(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dark-border pt-6">
                    <h3 className="font-semibold text-white mb-4">Service Area</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Service Radius: {serviceRadius} miles
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={serviceRadius}
                        onChange={(e) => setServiceRadius(parseInt(e.target.value))}
                        className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>5 miles</span>
                        <span>50 miles</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-accent-cyan text-dark-bg px-6 py-2 rounded-lg hover:bg-accent-teal transition-colors font-semibold flex items-center"
                    >
                      {saved ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Pricing & Terms</h2>
                    <p className="text-gray-400 mb-6">
                      Set default rates and payment terms for your business
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Default Rates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Hourly Rate
                        </label>
                        <DecimalInput
                          value={hourlyRate}
                          onChange={setHourlyRate}
                          prefix="$"
                          suffix="/hour"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Material Markup
                        </label>
                        <DecimalInput
                          value={materialMarkup}
                          onChange={setMaterialMarkup}
                          suffix="%"
                          decimals={1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Travel Fee
                        </label>
                        <DecimalInput
                          value={travelFee}
                          onChange={setTravelFee}
                          prefix="$"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Emergency Rate (After Hours)
                        </label>
                        <DecimalInput
                          value={emergencyRate}
                          onChange={setEmergencyRate}
                          prefix="$"
                          suffix="/hour"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Payment Terms</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Default Payment Terms
                        </label>
                        <select
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Due on Receipt">Due on Receipt</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div>
                          <p className="font-medium text-white">Require Deposit</p>
                          <p className="text-sm text-gray-600">
                            Require upfront deposit on all jobs
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={depositRequired}
                            onChange={(e) => setDepositRequired(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      {depositRequired && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Deposit Percentage
                          </label>
                          <DecimalInput
                            value={depositPercentage}
                            onChange={setDepositPercentage}
                            suffix="%"
                            decimals={1}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Late Fee Percentage
                          </label>
                          <DecimalInput
                            value={lateFeePercentage}
                            onChange={setLateFeePercentage}
                            suffix="%"
                            decimals={1}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            After Days
                          </label>
                          <DecimalInput
                            value={lateFeeDays}
                            onChange={setLateFeeDays}
                            decimals={0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Tax Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div>
                          <p className="font-medium text-white">Apply Sales Tax</p>
                          <p className="text-sm text-gray-600">
                            Automatically add sales tax to invoices
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applySalesTax}
                            onChange={(e) => setApplySalesTax(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      {applySalesTax && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tax Rate
                            </label>
                            <DecimalInput
                              value={taxRate}
                              onChange={setTaxRate}
                              suffix="%"
                              decimals={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tax ID Number
                            </label>
                            <input
                              type="text"
                              value={taxId}
                              onChange={(e) => setTaxId(e.target.value)}
                              className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-accent-cyan text-dark-bg px-6 py-2 rounded-lg hover:bg-accent-teal transition-colors font-semibold flex items-center"
                    >
                      {saved ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'pricebook' && (
                <PriceBookTab />
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">AI Assistant</h2>
                    <p className="text-gray-400 mb-6">
                      Customize how your AI assistant communicates and automates tasks
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      AI Personality
                      <HelpCircle className="w-4 h-4 ml-2 text-gray-400" />
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Communication Style
                        </label>
                        <select
                          value={aiStyle}
                          onChange={(e) => setAiStyle(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="casual">Casual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Response Speed
                        </label>
                        <select
                          value={responseSpeed}
                          onChange={(e) => setResponseSpeed(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="1-hour">1 Hour</option>
                          <option value="4-hours">4 Hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Follow-up Aggressiveness
                        </label>
                        <select
                          value={followUpStyle}
                          onChange={(e) => setFollowUpStyle(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="gentle">Gentle</option>
                          <option value="normal">Normal</option>
                          <option value="persistent">Persistent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">AI Behavior Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Auto-send Proposals</p>
                          <p className="text-sm text-gray-600">
                            AI sends proposals immediately after generation
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={autoSendProposals}
                            onChange={(e) => setAutoSendProposals(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Auto-follow up on Proposals</p>
                          <p className="text-sm text-gray-600">
                            Automatically send reminders to customers
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={autoFollowUp}
                            onChange={(e) => setAutoFollowUp(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      {autoFollowUp && (
                        <div className="ml-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Days before first follow-up: {followUpDays} days
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="7"
                            value={followUpDays}
                            onChange={(e) => setFollowUpDays(parseInt(e.target.value))}
                            className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1 day</span>
                            <span>7 days</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            Auto-send Invoices on Completion
                          </p>
                          <p className="text-sm text-gray-600">
                            Send invoice when job is marked complete
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={autoSendInvoices}
                            onChange={(e) => setAutoSendInvoices(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Auto-send Payment Reminders</p>
                          <p className="text-sm text-gray-600">
                            Remind customers about unpaid invoices
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={autoPaymentReminders}
                            onChange={(e) => setAutoPaymentReminders(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      {autoPaymentReminders && (
                        <div className="ml-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Days before reminder: {reminderDays} days
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="14"
                            value={reminderDays}
                            onChange={(e) => setReminderDays(parseInt(e.target.value))}
                            className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1 day</span>
                            <span>14 days</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">AI Learning</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Allow AI to Learn from Pricing</p>
                          <p className="text-sm text-gray-600">
                            AI improves estimates based on your pricing history
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={aiLearning}
                            onChange={(e) => setAiLearning(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Suggest Pricing Adjustments</p>
                          <p className="text-sm text-gray-600">
                            AI recommends price changes based on market data
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={suggestPricing}
                            onChange={(e) => setSuggestPricing(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          AI Confidence Threshold (for auto-sending)
                        </label>
                        <select
                          value={aiConfidence}
                          onChange={(e) => setAiConfidence(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="low">Low - AI sends most proposals</option>
                          <option value="medium">Medium - Balanced approach</option>
                          <option value="high">High - Only very confident proposals</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      <Mic className="w-5 h-5 mr-2 text-blue-600" />
                      Voice Transcription Settings
                    </h3>
                    <div className="bg-dark-bg border border-dark-border rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-400">
                        Voice transcription powered by OpenAI Whisper AI. Your audio is encrypted and not stored long-term.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Transcription Model
                        </label>
                        <select
                          value={voiceModel}
                          onChange={(e) => setVoiceModel(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="whisper-1">Whisper-1 (Best Accuracy)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Professional-grade voice transcription
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Language
                        </label>
                        <select
                          value={voiceLanguage}
                          onChange={(e) => setVoiceLanguage(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Audio Quality
                        </label>
                        <select
                          value={audioQuality}
                          onChange={(e) => setAudioQuality(e.target.value)}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        >
                          <option value="standard">Standard (Faster)</option>
                          <option value="high">High (Better Accuracy)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Auto-punctuation</p>
                          <p className="text-sm text-gray-600">
                            AI automatically adds punctuation to transcriptions
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={autoPunctuation}
                            onChange={(e) => setAutoPunctuation(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Delete Audio After Transcription</p>
                          <p className="text-sm text-gray-600">
                            Automatically remove audio files after processing for privacy
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={deleteAudioAfter}
                            onChange={(e) => setDeleteAudioAfter(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Custom Vocabulary
                          <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                        </label>
                        <textarea
                          value={customVocabulary}
                          onChange={(e) => setCustomVocabulary(e.target.value)}
                          placeholder="Add specialized terms, brand names, or materials you use often (comma-separated)"
                          rows={3}
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Example: Schluter, Kerdi Board, QuietWalk, DuraSeal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-accent-cyan text-dark-bg px-6 py-2 rounded-lg hover:bg-accent-teal transition-colors font-semibold flex items-center"
                    >
                      {saved ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
                    <p className="text-gray-400 mb-6">
                      Choose how you want to be notified about important events
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Email Notifications</h3>
                    <div className="space-y-2">
                      {Object.entries({
                        proposalSigned: 'New proposal signed',
                        paymentReceived: 'Payment received',
                        invoiceOverdue: 'Invoice overdue',
                        proposalViewed: 'Customer viewed proposal',
                        aiFollowUp: 'AI sent follow-up',
                        dailySummary: 'Daily summary',
                      }).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center p-3 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-card transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={emailNotifs[key as keyof typeof emailNotifs]}
                            onChange={(e) =>
                              setEmailNotifs({ ...emailNotifs, [key]: e.target.checked })
                            }
                            className="w-5 h-5 text-accent-cyan border-dark-border rounded focus:ring-accent-cyan"
                          />
                          <span className="ml-3 text-white">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Text/SMS Notifications</h3>
                    <div className="space-y-2">
                      {Object.entries({
                        paymentReceived: 'Payment received',
                        proposalSigned: 'Proposal signed',
                        urgentOverdue: 'Urgent: Invoice 30+ days overdue',
                      }).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center p-3 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-card transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={smsNotifs[key as keyof typeof smsNotifs]}
                            onChange={(e) =>
                              setSmsNotifs({ ...smsNotifs, [key]: e.target.checked })
                            }
                            className="w-5 h-5 text-accent-cyan border-dark-border rounded focus:ring-accent-cyan"
                          />
                          <span className="ml-3 text-white">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-accent-cyan text-dark-bg px-6 py-2 rounded-lg hover:bg-accent-teal transition-colors font-semibold flex items-center"
                    >
                      {saved ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Payment Settings</h2>
                    <p className="text-gray-400 mb-6">
                      Configure how you accept payments from customers
                    </p>
                  </div>

                  <div className="bg-dark-card border-2 border-accent-green rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-2 flex items-center">
                          <Check className="w-5 h-5 text-accent-green mr-2" />
                          Stripe Connected
                        </h3>
                        <p className="text-sm text-gray-400">
                          Your payment processor is active and ready to accept payments
                        </p>
                      </div>
                      <button className="bg-dark-bg text-white border border-dark-border px-4 py-2 rounded-lg hover:bg-dark-card transition-colors text-sm font-medium">
                        Manage Account
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Accepted Payment Methods</h3>
                    <div className="space-y-2">
                      {Object.entries({
                        card: 'Credit/Debit Cards (via Stripe)',
                        ach: 'ACH/Bank Transfer',
                        cash: 'Cash',
                        check: 'Check',
                      }).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center p-3 bg-dark-bg rounded-lg cursor-pointer hover:bg-dark-card transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={acceptedPayments[key as keyof typeof acceptedPayments]}
                            onChange={(e) =>
                              setAcceptedPayments({ ...acceptedPayments, [key]: e.target.checked })
                            }
                            className="w-5 h-5 text-accent-cyan border-dark-border rounded focus:ring-accent-cyan"
                          />
                          <span className="ml-3 text-white">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Payment Processing</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-dark-bg rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Transaction Fee (Stripe)</p>
                        <p className="text-lg font-semibold text-white">2.9% + $0.30</p>
                        <p className="text-xs text-gray-500 mt-1">Standard Stripe pricing</p>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-white">Pass Fees to Customer</p>
                          <p className="text-sm text-gray-600">
                            Add convenience fee to cover processing costs
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={passFees}
                            onChange={(e) => setPassFees(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                        </label>
                      </div>

                      {passFees && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Convenience Fee Percentage
                          </label>
                          <DecimalInput
                            value={convenienceFee}
                            onChange={setConvenienceFee}
                            suffix="%"
                            decimals={2}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-accent-cyan text-dark-bg px-6 py-2 rounded-lg hover:bg-accent-teal transition-colors font-semibold flex items-center"
                    >
                      {saved ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Templates</h2>
                    <p className="text-gray-400 mb-6">
                      Customize your proposal and invoice templates
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Proposal Template</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Header Text
                        </label>
                        <input
                          type="text"
                          placeholder="Thank you for considering [Your Business Name]"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Footer Text
                        </label>
                        <input
                          type="text"
                          placeholder="We look forward to working with you"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Terms & Conditions
                        </label>
                        <textarea
                          placeholder="Enter your standard terms and conditions..."
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Invoice Template</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Header Text
                        </label>
                        <input
                          type="text"
                          placeholder="Invoice from [Your Business Name]"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payment Instructions
                        </label>
                        <textarea
                          placeholder="Payment can be made by card, check, or cash..."
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent min-h-[80px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thank You Message
                        </label>
                        <input
                          type="text"
                          placeholder="Thank you for your business!"
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Communication Templates</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Use variables: {'{customer_name}'}, {'{amount}'}, {'{job_title}'}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Proposal Sent Message
                        </label>
                        <textarea
                          placeholder="Hi {customer_name}! Your proposal for {job_title} is ready..."
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Invoice Sent Message
                        </label>
                        <textarea
                          placeholder="Hi {customer_name}! Your invoice is ready. Amount due: ${'{amount}'}..."
                          className="w-full px-4 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-accent-cyan text-dark-bg px-6 py-2 rounded-lg hover:bg-accent-teal transition-colors font-semibold flex items-center"
                    >
                      {saved ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Account & Billing</h2>
                    <p className="text-gray-400 mb-6">Manage your subscription and account settings</p>
                  </div>

                  <div className="bg-dark-card rounded-xl p-6 border-2 border-dark-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">Professional Plan</h3>
                        <p className="text-3xl font-bold text-accent-cyan mt-1">$99/month</p>
                      </div>
                      <span className="bg-accent-green/20 text-accent-green text-xs font-semibold px-3 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Next billing date: January 15, 2026
                    </p>
                    <p className="text-xs text-gray-500">
                      Payment method: •••• 1234
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">Usage This Month</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-dark-bg rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Proposals</p>
                        <p className="text-2xl font-bold text-white">23</p>
                      </div>
                      <div className="p-4 bg-dark-bg rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Invoices</p>
                        <p className="text-2xl font-bold text-white">18</p>
                      </div>
                      <div className="p-4 bg-dark-bg rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-white">$45K</p>
                      </div>
                      <div className="p-4 bg-dark-bg rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Fees</p>
                        <p className="text-2xl font-bold text-white">$1.3K</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Plan Features</h3>
                    <ul className="space-y-2">
                      {[
                        'Unlimited proposals',
                        'Unlimited invoices',
                        'Unlimited customers',
                        'AI-powered automation',
                        'Email & text support',
                        '2.9% + $0.30 transaction fees',
                      ].map((feature) => (
                        <li key={feature} className="flex items-center text-gray-300">
                          <Check className="w-5 h-5 text-accent-green mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Billing History</h3>
                    <div className="space-y-2">
                      {[
                        { date: 'Dec 15, 2025', amount: '$99.00', status: 'Paid' },
                        { date: 'Nov 15, 2025', amount: '$99.00', status: 'Paid' },
                        { date: 'Oct 15, 2025', amount: '$99.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-dark-bg rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-white">{invoice.date}</p>
                            <p className="text-sm text-gray-600">{invoice.amount}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {invoice.status}
                            </span>
                            <button className="text-blue-600 hover:text-blue-700 p-2">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                      App Installation
                    </h3>
                    <div className="bg-dark-card rounded-xl p-6 border-2 border-dark-border">
                      {isInstalled ? (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-100 p-3 rounded-full">
                              <Check className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-white">Installed as App</p>
                              <p className="text-sm text-gray-600">Running in standalone mode</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-600">Status</span>
                              <span className="font-semibold text-green-600">Active</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-600">Version</span>
                              <span className="font-semibold text-white">2.0.0</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-600">Offline Mode</span>
                              <span className="font-semibold text-blue-600">Enabled</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-emerald-100 p-3 rounded-full">
                              <Smartphone className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-white">Not Installed</p>
                              <p className="text-sm text-gray-600">Running in browser mode</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-4">
                            Install FlashQuote on your home screen for faster access, offline support, and a native app experience.
                          </p>
                          <button className="w-full text-white px-4 py-3 rounded-lg transition-all font-semibold flex items-center justify-center" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}>
                            <Download className="w-5 h-5 mr-2" />
                            Install App
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      Login & Security
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-dark-bg rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium text-white">Stay Logged In</p>
                            <p className="text-sm text-gray-600">Remember me for 30 days</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-dark-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                          </label>
                        </div>
                      </div>

                      <div className="bg-dark-bg rounded-lg p-4">
                        <p className="font-medium text-white mb-3">Active Sessions</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {isInstalled ? 'This device (App)' : 'This device (Browser)'}
                                </p>
                                <p className="text-xs text-gray-500">Active now</p>
                              </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Current
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to log out from all devices? You will need to log in again on each device.')) {
                            await signOutAllDevices();
                            showToast('Logged out from all devices', 'success');
                          }
                        }}
                        className="w-full bg-dark-bg text-red-500 border-2 border-red-500 px-4 py-3 rounded-lg hover:bg-red-900/20 transition-colors font-semibold flex items-center justify-center"
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout All Devices
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-white mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={toggleDemoMode}
                        className={`w-full ${isDemoMode ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-accent-cyan'} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-all text-left font-medium flex items-center justify-between`}
                      >
                        <div className="flex items-center">
                          <Download className="w-5 h-5 mr-2" />
                          {isDemoMode ? 'Demo Mode: ON' : 'Demo Mode: OFF'}
                        </div>
                        <span className="text-xs opacity-75">
                          {isDemoMode ? 'Click to show real data' : 'Click to show demo data'}
                        </span>
                      </button>
                      <button className="w-full bg-dark-bg text-white border border-dark-border px-4 py-3 rounded-lg hover:bg-dark-card transition-colors text-left font-medium">
                        Change Password
                      </button>
                      <button className="w-full bg-dark-bg text-white border border-dark-border px-4 py-3 rounded-lg hover:bg-dark-card transition-colors text-left font-medium">
                        Update Payment Method
                      </button>
                      <button className="w-full text-white px-4 py-3 rounded-lg transition-all text-left font-medium flex items-center" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}>
                        <Download className="w-5 h-5 mr-2" />
                        Download All Data
                      </button>
                      <button className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors text-left font-medium">
                        Cancel Subscription
                      </button>
                      <button className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors text-left font-medium flex items-center">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
