import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export interface StripeAccountStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requiresAction: boolean;
  requirements?: string[];
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentLinkResult {
  url: string;
  id: string;
}

export const stripeConfig = {
  currency: 'usd',
  platformFeePercent: 0.029,

  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  },

  formatFromCents(cents: number): number {
    return cents / 100;
  },

  calculateFee(amount: number): number {
    return Math.round(amount * this.platformFeePercent * 100) / 100;
  },

  calculateNetAmount(amount: number): number {
    const fee = this.calculateFee(amount);
    return Math.round((amount - fee) * 100) / 100;
  }
};
