import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';
import { stripeService } from '../lib/stripeService';
import { CreditCard, Lock } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface PaymentFormProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentFormInner({
  invoiceId,
  invoiceNumber,
  amount,
  customerName,
  customerEmail,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { clientSecret } = await stripeService.createPaymentIntent(invoiceId);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const paymentIntent = await stripeService.confirmCardPayment(
        clientSecret,
        cardElement,
        {
          name,
          email,
        }
      );

      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Invoice Number</span>
          <span className="font-semibold text-gray-900">{invoiceNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount Due</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                  iconColor: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
        <Lock className="w-3 h-3 mr-1" />
        Secured by Stripe
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500">
        By completing this payment, you agree to these terms and conditions.
      </p>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}
