import { useState } from 'react';
import { CheckCircle, Circle, ArrowLeft, Lightbulb, AlertTriangle, Settings, DollarSign, FileText, CreditCard, Brain, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GettingStartedPage() {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Complete Your Business Profile', time: '2 minutes', completed: false },
    { id: 2, text: 'Set Your Pricing & Terms', time: '2 minutes', completed: false },
    { id: 3, text: 'Create Your First Proposal', time: '5 minutes', completed: false },
    { id: 4, text: 'Connect Payment Processing', time: '3 minutes', completed: false },
    { id: 5, text: 'Customize Your AI Settings', time: '1 minute', completed: false },
  ]);

  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercentage = (completedCount / checklist.length) * 100;
  const allCompleted = completedCount === checklist.length;

  return (
          <div className="max-w-5xl mx-auto px-4 pb-12">
        <Link
          to="/dashboard/help"
          className="inline-flex items-center text-emerald-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Getting Started with FlashQuote
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Everything you need to know in 5 minutes
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 mb-12 border-2 border-emerald-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Message</h2>
          <div className="text-gray-700 space-y-4 leading-relaxed">
            <p>
              <strong>Welcome to FlashQuote!</strong> You made the right choice. This guide will walk you through everything you need to know to create your first proposal and start getting paid faster.
            </p>
            <p>
              Don't worry - there's no complicated setup. No training videos to watch. Just follow these simple steps and you'll be up and running in minutes.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Start Checklist</h2>
            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
              {completedCount} of {checklist.length} completed
            </span>
          </div>

          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-green-600 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {progressPercentage === 0 && "Let's get started!"}
              {progressPercentage > 0 && progressPercentage < 100 && `${Math.round(progressPercentage)}% complete - you're doing great!`}
              {progressPercentage === 100 && "🎉 All done! You're ready to go!"}
            </p>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-center p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all group border-2 border-transparent hover:border-emerald-200"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="hidden"
                />
                <div className="flex-shrink-0 mr-4">
                  {item.completed ? (
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  ) : (
                    <Circle className="w-7 h-7 text-gray-400 group-hover:text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-lg font-semibold block ${
                      item.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    Step {item.id}: {item.text}
                  </span>
                  <span className="text-sm text-gray-500">{item.time}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-8" id="steps">
          <div id="step1" className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 1 ? null : 1)}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <Settings className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Step 1: Complete Your Business Profile</h3>
                    <p className="text-blue-100 text-sm mt-1">2 minutes • Make your proposals look professional</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-transform ${expandedStep === 1 ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {expandedStep === 1 && (
              <div className="p-8">
                <p className="text-lg text-gray-700 mb-6 font-semibold">
                  First, let's set up your business information so your proposals look professional.
                </p>

                <div className="bg-emerald-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Instructions:</h4>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
                      <span>Click your name in the top-right corner</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
                      <span>Select "Settings"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
                      <span>Go to "Business Profile" tab</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
                      <div>
                        <span className="font-semibold">Fill in:</span>
                        <ul className="ml-4 mt-2 space-y-1 text-gray-600">
                          <li>• Business Name (shows on proposals)</li>
                          <li>• Your Name (appears on signatures)</li>
                          <li>• Phone Number (where customers can reach you)</li>
                          <li>• Email Address (for notifications)</li>
                          <li>• Business Address (shows on invoices)</li>
                          <li>• Upload Logo (optional but recommended)</li>
                        </ul>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                  <div className="flex items-start">
                    <Lightbulb className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Tip:</strong> Your logo appears on every proposal and invoice - makes you look more professional</p>
                      <p><strong>Tip:</strong> Use your business phone number, not personal, if you have one</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/dashboard/settings"
                    className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-lg"
                  >
                    Go to Settings <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <button
                    onClick={() => toggleChecklistItem(1)}
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div id="step2" className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 2 ? null : 2)}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Step 2: Set Your Pricing & Terms</h3>
                    <p className="text-green-100 text-sm mt-1">2 minutes • Tell the AI about your rates</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-transform ${expandedStep === 2 ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {expandedStep === 2 && (
              <div className="p-8">
                <p className="text-lg text-gray-700 mb-6 font-semibold">
                  Tell the AI about your rates so it can price jobs accurately.
                </p>

                <div className="bg-green-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Instructions:</h4>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
                      <span>In Settings, go to "Pricing & Terms"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
                      <div>
                        <span className="font-semibold">Enter:</span>
                        <ul className="ml-4 mt-2 space-y-1 text-gray-600">
                          <li>• Your hourly rate (e.g., $85/hour)</li>
                          <li>• Material markup percentage (typically 15-30%)</li>
                          <li>• Default payment terms (Net 15, Net 30, or Due on Receipt)</li>
                          <li>• Deposit required? (Yes/No)</li>
                          <li>• If yes, deposit percentage (typically 25-50%)</li>
                        </ul>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-3">Why This Matters:</h4>
                  <p className="text-gray-700 mb-4">
                    Your AI uses these numbers to automatically calculate job prices. You can always adjust specific proposals, but this gives the AI a starting point.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-emerald-200">
                    <p className="text-sm text-gray-600 mb-2"><strong>Example:</strong></p>
                    <p className="text-gray-700">If you say bathroom remodel takes 4 days, AI calculates:</p>
                    <p className="font-mono text-sm text-gray-900 mt-2">
                      4 days × 8 hours × $85/hour = $2,720 labor<br />
                      Plus materials with your markup
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                  <div className="flex items-start">
                    <Lightbulb className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Tip:</strong> Not sure what to charge? AI will learn from your completed jobs and suggest adjustments</p>
                      <p><strong>Tip:</strong> You can change these anytime - it won't affect existing proposals</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/dashboard/settings"
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg"
                  >
                    Configure Pricing <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <button
                    onClick={() => toggleChecklistItem(2)}
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div id="step3" className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 3 ? null : 3)}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Step 3: Create Your First Proposal</h3>
                    <p className="text-purple-100 text-sm mt-1">5 minutes • This is the fun part!</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-transform ${expandedStep === 3 ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {expandedStep === 3 && (
              <div className="p-8">
                <p className="text-lg text-gray-700 mb-6 font-semibold">
                  This is the fun part - see how fast FlashQuote works.
                </p>

                <div className="bg-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Instructions:</h4>
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
                      <span>Click "New Job" button (or press N key)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
                      <div>
                        <span>Enter customer info:</span>
                        <ul className="ml-4 mt-1 space-y-1 text-gray-600 text-sm">
                          <li>• Name</li>
                          <li>• Phone or Email</li>
                          <li>• Address (optional now)</li>
                        </ul>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
                      <span>Click the big blue microphone button</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
                      <div>
                        <span>Walk around and talk naturally</span>
                        <div className="bg-white rounded-lg p-4 mt-2 border border-purple-200">
                          <p className="text-sm font-semibold mb-2">Example:</p>
                          <p className="text-gray-600 italic text-sm leading-relaxed">
                            "Okay, so this is a bathroom remodel. The bathroom is about 8 by 10 feet. They want new tile on the floor and halfway up the walls. The grout is totally shot. Subfloor feels solid. They showed me some mid-range tile they like. The toilet needs to come out and go back in. Should take about 3 to 4 days."
                          </p>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">5</span>
                      <span>Take photos while you talk</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">6</span>
                      <span>Click "Generate Proposal"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">7</span>
                      <span>AI creates proposal in 30 seconds</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">8</span>
                      <span>Review and adjust if needed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">9</span>
                      <span>Click "Send Proposal"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">10</span>
                      <span>Choose: Text, Email, or Both</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">11</span>
                      <span className="font-semibold">Done!</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                  <div className="flex items-start">
                    <Lightbulb className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Tip:</strong> The AI understands contractor language - just talk naturally</p>
                      <p><strong>Tip:</strong> You can edit anything the AI generates before sending</p>
                      <p><strong>Tip:</strong> Take lots of photos - customers love seeing the before state</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/dashboard/new-job"
                    className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg"
                  >
                    Create First Proposal <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <button
                    onClick={() => toggleChecklistItem(3)}
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div id="step4" className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 4 ? null : 4)}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Step 4: Connect Payment Processing</h3>
                    <p className="text-purple-100 text-sm mt-1">3 minutes • Get paid faster</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-transform ${expandedStep === 4 ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {expandedStep === 4 && (
              <div className="p-8">
                <p className="text-lg text-gray-700 mb-6 font-semibold">
                  So you can get paid through the app (optional but highly recommended).
                </p>

                <div className="bg-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Instructions:</h4>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
                      <span>Go to Settings → Payment Settings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
                      <span>Click "Connect Stripe Account"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
                      <div>
                        <span>Follow Stripe's signup (takes 3 minutes):</span>
                        <ul className="ml-4 mt-1 space-y-1 text-gray-600 text-sm">
                          <li>• Business info</li>
                          <li>• Bank account (where money goes)</li>
                          <li>• Tax ID (EIN or SSN)</li>
                        </ul>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
                      <span>Return to FlashQuote - you're connected!</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-3">Why Connect Stripe:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Customers pay with credit card (you get money in 1-2 days)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Automatic invoicing and payment tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>AI chases overdue payments for you</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>No separate invoice management needed</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Looks professional to customers</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Fees:</h4>
                  <p className="text-gray-700 mb-3">
                    Stripe charges 2.9% + $0.30 per transaction (industry standard). This is what ALL payment processors charge. We don't mark it up.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold mb-2">Example:</p>
                    <p className="text-gray-700 text-sm">$3,000 job = $87 + $0.30 = $87.30 fee</p>
                    <p className="text-gray-700 text-sm font-semibold">You get: $2,912.70 in your bank account</p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                  <div className="flex items-start">
                    <Lightbulb className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Tip:</strong> You can still accept cash/check - just mark invoice as 'Paid\' manually</p>
                      <p><strong>Tip:</strong> Customers are 3x more likely to pay immediately with card option</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/dashboard/settings"
                    className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg"
                  >
                    Connect Stripe <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <button
                    onClick={() => toggleChecklistItem(4)}
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          <div id="step5" className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === 5 ? null : 5)}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <Brain className="w-8 h-8 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Step 5: Customize Your AI Settings</h3>
                    <p className="text-pink-100 text-sm mt-1">1 minute • Teach your AI how to work</p>
                  </div>
                </div>
                <ArrowRight className={`w-6 h-6 transition-transform ${expandedStep === 5 ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {expandedStep === 5 && (
              <div className="p-8">
                <p className="text-lg text-gray-700 mb-6 font-semibold">
                  Tell your AI assistant how you want it to behave.
                </p>

                <div className="bg-pink-50 rounded-xl p-6 mb-6 border-2 border-pink-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Settings to Configure:</h4>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <p className="font-semibold mb-2">Communication Style:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li>• Professional (formal, business-like)</li>
                        <li>• Friendly (warm but professional) ← Recommended</li>
                        <li>• Casual (relaxed, conversational)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Auto-Follow Up Settings:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li>• First follow-up after: 2 days (recommended)</li>
                        <li>• Send reminders: Yes/No</li>
                        <li>• How persistent: Gentle / Normal / Persistent</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Auto-Send Options:</p>
                      <ul className="ml-4 space-y-1 text-sm">
                        <li>• Send proposals immediately: Yes/No</li>
                        <li>• Send invoices when job complete: Yes/No</li>
                        <li>• Send payment reminders: Yes/No</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 mb-6 border-2 border-emerald-200">
                  <h4 className="font-bold text-gray-900 mb-3">Recommended Settings (for most contractors):</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Communication Style: Friendly</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>First follow-up: 2 days</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Send reminders: Yes</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Persistence: Normal</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Auto-send proposals: No (review first)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Auto-send invoices: Yes</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Payment reminders: Yes</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                  <div className="flex items-start">
                    <Lightbulb className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Tip:</strong> Start with 'review first' until you trust the AI</p>
                      <p><strong>Tip:</strong> AI learns from your edits and gets better over time</p>
                      <p><strong>Tip:</strong> You can change these settings anytime</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/dashboard/settings"
                    className="inline-flex items-center bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-colors font-semibold shadow-lg"
                  >
                    Configure AI <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <button
                    onClick={() => toggleChecklistItem(5)}
                    className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {allCompleted && (
          <div className="mt-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-10 text-white text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto leading-relaxed">
              Your FlashQuote account is fully configured and ready to use.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-4">What's Next?</h3>
              <ul className="text-left space-y-2 text-green-100">
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Go create your first real proposal</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Check out the video tutorials below</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Explore the FAQ for specific questions</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Contact us anytime if you need help</span>
                </li>
              </ul>
            </div>
            <p className="text-green-100 mb-8 italic">
              Remember: The AI gets smarter with every job you complete. The more you use it, the better it works for you.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/dashboard"
                className="inline-flex items-center bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-green-50 transition-colors font-bold text-lg shadow-lg"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/dashboard/help/tutorials"
                className="inline-flex items-center bg-green-700 text-white px-8 py-4 rounded-xl hover:bg-green-800 transition-colors font-bold text-lg shadow-lg"
              >
                Watch Video Tutorials <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        )}
      </div>
  );
}
