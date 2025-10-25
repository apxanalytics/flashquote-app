import { authHeaders } from '../utils/auth';
import { getStripe, StripeAccountStatus, PaymentIntentResult, PaymentLinkResult } from './stripe';



async function getAuthHeaders() {
  };
}

export const stripeService = {
  async createStripeAccount(): Promise<{ accountId: string; chargesEnabled: boolean; payoutsEnabled: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/functions/v1/create-stripe-account`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Stripe account');
    }

    return response.json();
  },

  async createOnboardingLink(returnUrl?: string, refreshUrl?: string): Promise<{ url: string }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/functions/v1/create-stripe-onboarding-link`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ returnUrl, refreshUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create onboarding link');
    }

    return response.json();
  },

  async getStripeAccountStatus(): Promise<StripeAccountStatus> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('contractor_profiles')
      .select('stripe_account_id, stripe_account_status, stripe_charges_enabled, stripe_payouts_enabled')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_account_id) {
      },
      body: JSON.stringify({ invoiceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment intent');
    }

    return response.json();
  },

  async createPaymentLink(invoiceId: string): Promise<PaymentLinkResult> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/functions/v1/create-payment-link`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ invoiceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment link');
    }

    return response.json();
  },

  async confirmCardPayment(clientSecret: string, cardElement: any, billingDetails: any) {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe not loaded');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return paymentIntent;
  },

  async getPaymentTransactions(limit = 50) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*, invoice:invoices(invoice_number, customer:customers(name))')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getPayoutRecords(limit = 50) {
    const { data, error } = await supabase
      .from('payout_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async calculateRevenue(startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('payment_transactions')
      .select('amount, fee_amount, net_amount, created_at')
      .eq('status', 'succeeded');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalRevenue = data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const totalFees = data?.reduce((sum, tx) => sum + Number(tx.fee_amount), 0) || 0;
    const netRevenue = data?.reduce((sum, tx) => sum + Number(tx.net_amount), 0) || 0;

