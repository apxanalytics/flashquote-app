import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../lib/formatters';
import {
  Edit3,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Send,
  Save,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface MaterialItem {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  price: number;
}

interface ScopeItem {
  id: string;
  text: string;
}

export default function ProposalReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobData = location.state || {};

  const [customerName] = useState(jobData.customerName || 'John Smith');
  const [customerContact] = useState(jobData.customerContact || '(555) 123-4567');
  const [customerAddress] = useState(jobData.customerAddress || '123 Main Street, City, ST 12345');
  const [jobTitle, setJobTitle] = useState('Bathroom Remodel - Smith Residence');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [scopeExpanded, setScopeExpanded] = useState(true);
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const [laborExpanded, setLaborExpanded] = useState(true);
  const [timelineExpanded, setTimelineExpanded] = useState(true);

  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([
    { id: '1', text: 'Remove existing bathroom tile (floor and walls)' },
    { id: '2', text: 'Install new ceramic tile flooring (80 sq ft)' },
    { id: '3', text: 'Install tile walls halfway up (160 sq ft)' },
    { id: '4', text: 'Remove and reinstall toilet' },
    { id: '5', text: 'Clean and prepare subfloor' },
  ]);

  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: '1', item: 'Ceramic floor tile', quantity: 90, unit: 'sq ft', price: 4.5 },
    { id: '2', item: 'Wall tile', quantity: 170, unit: 'sq ft', price: 3.25 },
    { id: '3', item: 'Thinset mortar', quantity: 3, unit: 'bags', price: 22 },
    { id: '4', item: 'Grout', quantity: 2, unit: 'bags', price: 18 },
    { id: '5', item: 'Toilet wax ring', quantity: 1, unit: 'each', price: 8 },
  ]);

  const [laborHours, setLaborHours] = useState(32);
  const [laborRate, setLaborRate] = useState(85);
  const [duration, setDuration] = useState(4);
  const [startDate, setStartDate] = useState('');

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendViaText, setSendViaText] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const materialsSubtotal = materials.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const laborSubtotal = laborHours * laborRate;
  const subtotal = materialsSubtotal + laborSubtotal;
  const tax = 0;
  const total = subtotal + tax;

  const handleScopeEdit = (id: string, newText: string) => {
    setScopeItems(prev =>
      prev.map(item => (item.id === id ? { ...item, text: newText } : item))
    );
  };

  const handleDeleteScope = (id: string) => {
    setScopeItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddScope = () => {
    const newId = (Math.max(...scopeItems.map(i => parseInt(i.id))) + 1).toString();
    setScopeItems(prev => [...prev, { id: newId, text: 'New work item' }]);
  };

  const handleSendProposal = () => {
    setShowSendModal(false);
    alert('Proposal sent! (Feature coming soon)');
    navigate('/dashboard');
  };

  return (
          <div className="max-w-5xl mx-auto pb-32">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Proposal Review
            </h1>
            <button
              onClick={() => navigate('/dashboard/new-job')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Job
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{customerName}</div>
            <div className="text-sm text-gray-600">{customerContact}</div>
            {customerAddress && (
              <div className="text-sm text-gray-600">{customerAddress}</div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                className="flex-1 text-xl font-bold text-gray-900 border-b-2 border-blue-600 focus:outline-none"
                autoFocus
              />
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">{jobTitle}</h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setScopeExpanded(!scopeExpanded)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900">Scope of Work</h3>
              {scopeExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {scopeExpanded && (
              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  {scopeItems.map((item) => (
                    <li key={item.id} className="flex items-start space-x-3 group">
                      <span className="text-blue-600 mt-1">•</span>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleScopeEdit(item.id, e.target.value)}
                        className="flex-1 text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:outline-none transition-colors"
                      />
                      <button
                        onClick={() => handleDeleteScope(item.id)}
                        className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleAddScope}
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setMaterialsExpanded(!materialsExpanded)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900">Materials</h3>
              {materialsExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {materialsExpanded && (
              <div className="px-6 pb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Item</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Unit</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Price</th>
                        <th className="text-right py-2 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr key={material.id} className="border-b border-gray-100">
                          <td className="py-3 text-gray-900">{material.item}</td>
                          <td className="text-right text-gray-900">{material.quantity}</td>
                          <td className="text-right text-gray-600">{material.unit}</td>
                          <td className="text-right text-gray-900">
                            {formatCurrency(material.price)}
                          </td>
                          <td className="text-right font-semibold text-gray-900">
                            {formatCurrency(material.quantity * material.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="pt-3 text-right font-semibold text-gray-700">
                          Materials Subtotal:
                        </td>
                        <td className="pt-3 text-right font-bold text-gray-900">
                          {formatCurrency(materialsSubtotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setLaborExpanded(!laborExpanded)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900">Labor</h3>
              {laborExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {laborExpanded && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">
                  Professional tile installation and finishing
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Number(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <span className="text-gray-700">hours @</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">$</span>
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <span className="text-gray-700">/hour</span>
                  </div>
                  <span className="text-gray-700">=</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(laborSubtotal)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setTimelineExpanded(!timelineExpanded)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
              {timelineExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            {timelineExpanded && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <span className="text-gray-700">days</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
            <span>Pricing confidence: Based on your last 8 similar jobs</span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 lg:pl-64 z-30">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(materialsSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(laborSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => alert('Draft saved!')}
                className="flex-1 flex items-center justify-center bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Draft
              </button>
              <button
                onClick={() => navigate('/dashboard/new-job', { state: jobData })}
                className="flex-1 flex items-center justify-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Edit More
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="flex-1 flex items-center justify-center text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
              >
                <Send className="w-5 h-5 mr-2" />
                Send Proposal
              </button>
            </div>
          </div>
        </div>

        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How should we send this?
              </h2>

              <div className="space-y-3 mb-6">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sendViaText}
                    onChange={(e) => setSendViaText(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Text message</div>
                    <div className="text-sm text-gray-600">to {customerContact}</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sendViaEmail}
                    onChange={(e) => setSendViaEmail(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">
                      to {jobData.customerEmail || 'customer@email.com'}
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Message Preview:
                </div>
                <p className="text-sm text-gray-600">
                  "Hi {customerName.split(' ')[0]}! Here's your bathroom remodel proposal
                  from {jobData.businessName || 'FlashQuote'}. Tap to view and sign:
                  [link]"
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[80px]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendProposal}
                  disabled={!sendViaText && !sendViaEmail}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)')} onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)')}
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
