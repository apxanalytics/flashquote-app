import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Send, Save, Calendar, X, MessageSquare, Mail } from 'lucide-react';
import { InvoiceLineItem } from '../types/invoice';
import { formatCurrency } from '../lib/formatters';

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobData = location.state?.job;

  const [invoiceNumber] = useState(`INV-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('Net 15');

  const [customerName, setCustomerName] = useState(jobData?.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(jobData?.customerEmail || '');
  const [customerPhone, setCustomerPhone] = useState(jobData?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(jobData?.customerAddress || '');

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    jobData
      ? [
          {
            id: '1',
            description: jobData.jobTitle || 'Service',
            quantity: 1,
            rate: jobData.price || 0,
            amount: jobData.price || 0,
          },
        ]
      : [
          {
            id: '1',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ]
  );

  const [taxRate, setTaxRate] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendViaText, setSendViaText] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later'>('now');

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const balanceDue = total - depositAmount;

  const handleLineItemChange = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleAddLineItem = () => {
    const newId = (Math.max(...lineItems.map((i) => parseInt(i.id))) + 1).toString();
    setLineItems((prev) => [
      ...prev,
      { id: newId, description: '', quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleDeleteLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handlePaymentTermsChange = (terms: string) => {
    setPaymentTerms(terms);
    const invoiceDateObj = new Date(invoiceDate);
    let daysToAdd = 15;

    if (terms === 'Net 30') daysToAdd = 30;
    else if (terms === 'Due on Receipt') daysToAdd = 0;

    const newDueDate = new Date(invoiceDateObj.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    setDueDate(newDueDate.toISOString().split('T')[0]);
  };

  const handleSaveDraft = () => {
    if (!customerName) {
      alert('Please enter a customer name');
      return;
    }
    alert('Invoice saved as draft!');
    navigate('/dashboard/invoices');
  };

  const handleSendInvoice = () => {
    if (!customerName) {
      alert('Please enter a customer name');
      return;
    }
    if (lineItems.some((item) => !item.description)) {
      alert('Please fill in all line item descriptions');
      return;
    }
    alert('Invoice sent successfully!');
    setShowSendModal(false);
    navigate('/dashboard/invoices');
  };

  return (
          <div className="max-w-5xl mx-auto pb-32">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Create Invoice
            </h1>
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="text-accent-cyan hover:text-accent-teal text-sm font-medium"
            >
              ← Back to Invoices
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bill To:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="123 Main Street, City, ST 12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Line Items</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-2 font-semibold text-gray-700 w-2/5">
                    Description
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700 w-1/6">
                    Quantity
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700 w-1/5">
                    Rate
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700 w-1/5">
                    Amount
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 pr-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(item.id, 'description', e.target.value)
                        }
                        placeholder="Description of service"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            item.id,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                          $
                        </span>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              'rate',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 pl-2">
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => handleDeleteLineItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleAddLineItem}
            className="mt-4 flex items-center text-blue-600 hover:text-emerald-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Line Item
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Payment Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => handlePaymentTermsChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit/Payment Received
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                      $
                    </span>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Accepted Payment Methods:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Credit/Debit Card (via Stripe)</li>
                  <li>• Bank Transfer</li>
                  <li>• Check</li>
                  <li>• Cash</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Totals</h3>

              <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({taxRate}%):</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(taxAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-3">
                    <span className="font-semibold text-gray-700">Total:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  {depositAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-semibold text-green-600">
                          -{formatCurrency(depositAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t-2 border-gray-400 pt-3">
                        <span className="text-lg font-bold text-gray-900">
                          Balance Due:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(balanceDue)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or payment instructions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 lg:pl-64 z-30">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex-1 flex items-center justify-center bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Draft
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="flex-1 flex items-center justify-center text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}
            >
              <Send className="w-5 h-5 mr-2" />
              Send Invoice
            </button>
          </div>
        </div>

        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Send Invoice</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Send via:</p>
                  <div className="space-y-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendViaText}
                        onChange={(e) => setSendViaText(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Text message
                        </div>
                        <div className="text-sm text-gray-600">to {customerPhone}</div>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendViaEmail}
                        onChange={(e) => setSendViaEmail(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </div>
                        <div className="text-sm text-gray-600">
                          to {customerEmail || 'customer@email.com'}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Message Preview:
                  </div>
                  <p className="text-sm text-gray-600">
                    "Hi {customerName.split(' ')[0] || 'there'}! Your invoice for{' '}
                    {jobData?.jobTitle || 'services rendered'} is ready. Total due: $
                    {balanceDue.toFixed(2)}. Pay instantly here: [link]"
                  </p>
                </div>

                <div>
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

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Schedule:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setScheduleOption('now')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        scheduleOption === 'now'
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Send Now
                    </button>
                    <button
                      onClick={() => setScheduleOption('later')}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        scheduleOption === 'later'
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Schedule for Later
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvoice}
                  disabled={!sendViaText && !sendViaEmail}
                  className="flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)'}} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)')} onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)')}
                >
                  {scheduleOption === 'now' ? 'Send' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
