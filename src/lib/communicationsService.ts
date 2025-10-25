import {
  generateProposalEmail,
  generateInvoiceEmail,
  generatePaymentReminderEmail,
  generatePaymentReceivedEmail,
} from './emailTemplates';
import { authHeaders } from '../utils/auth';
import { fn } from './api';

async function getAuthHeaders() {
  return {
    ...(await authHeaders()),
    'Content-Type': 'application/json',
  };
}

export const communicationsService = {
  async sendProposal(jobId: string, options = { sms: true, email: true }) {
    const headers = await getAuthHeaders();
    const response = await fetch(fn('send-proposal'), {
      credentials: 'include',
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({
        jobId,
        sendSms: options.sms,
        sendEmail: options.email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send proposal');
    }

    return response.json();
  },

  async sendInvoice(invoiceId: string, options = { sms: true, email: true, includePaymentLink: true }) {
    const headers = await getAuthHeaders();
    const response = await fetch(fn('send-invoice'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        invoiceId,
        sendSms: options.sms,
        sendEmail: options.email,
        includePaymentLink: options.includePaymentLink,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invoice');
    }

    return response.json();
  },

  async sendSMS(to: string, message: string, metadata?: {
    type?: string;
    customerId?: string;
    jobId?: string;
    invoiceId?: string;
  }) {
    const headers = await getAuthHeaders();
    const response = await fetch(fn('send-sms'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to,
        message,
        ...metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send SMS');
    }

    return response.json();
  },

  async sendEmail(to: string, subject: string, html: string, metadata?: {
    type?: string;
    customerId?: string;
    jobId?: string;
    invoiceId?: string;
    from?: string;
  }) {
    const headers = await getAuthHeaders();
    const response = await fetch(fn('send-email'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to,
        subject,
        html,
        ...metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return response.json();
  },

  async getCommunications(limit = 50) {
    const { data, error } = await supabase
      .from('communications')
      .select('*, customer:customers(name), job:jobs(title), invoice:invoices(invoice_number)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getCommunicationCosts(months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('communication_costs')
      .select('*')
      .gte('month', startDate.toISOString().split('T')[0])
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCurrentMonthCosts() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const { data, error } = await supabase
      .from('communication_costs')
      .select('*')
      .eq('month', startOfMonth.toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { sms_count: 0, email_count: 0, total_cost: 0 };
  },

  async getCommunicationSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .select('communication_settings')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data?.communication_settings || {
      auto_follow_up: true,
      follow_up_days: 2,
      reminder_days_before: 3,
      send_sms: true,
      send_email: true,
    };
  },

  async updateCommunicationSettings(settings: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        communication_settings: settings,
      });

    if (error) throw error;
  },

  async sendPaymentReminder(invoiceId: string) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        job:jobs(title),
        contractor:contractor_profiles(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const business = {
      name: invoice.contractor?.business_name || 'FlashQuote',
      phone: invoice.contractor?.phone_number,
      email: invoice.contractor?.email,
    };

    const emailHtml = generatePaymentReminderEmail({
      customer_name: invoice.customer.name,
      invoice_number: invoice.invoice_number,
      amount: invoice.total,
      due_date: new Date(invoice.due_date).toLocaleDateString(),
      days_overdue: Math.max(0, daysOverdue),
      payment_link: invoice.stripe_payment_link || `${import.meta.env.VITE_APP_URL}/invoice/${invoice.id}`,
      business,
    });

    const results: any = {};

    if (invoice.customer.email) {
      try {
        results.email = await this.sendEmail(
          invoice.customer.email,
          `${daysOverdue > 7 ? 'URGENT: ' : ''}Payment Reminder - Invoice #${invoice.invoice_number}`,
          emailHtml,
          {
            type: 'payment_reminder',
            customerId: invoice.customer_id,
            invoiceId: invoice.id,
          }
        );
      } catch (error) {
        console.error('Failed to send reminder email:', error);
        results.email = { error: error.message };
      }
    }

    if (invoice.customer.phone) {
      const smsMessage = daysOverdue > 0
        ? `REMINDER: Invoice #${invoice.invoice_number} is ${daysOverdue} days overdue. Amount: $${invoice.total}. Pay now: ${invoice.stripe_payment_link}`
        : `Invoice #${invoice.invoice_number} for $${invoice.total} is due today. Pay now: ${invoice.stripe_payment_link}`;

      try {
        results.sms = await this.sendSMS(
          invoice.customer.phone,
          smsMessage,
          {
            type: 'payment_reminder',
            customerId: invoice.customer_id,
            invoiceId: invoice.id,
          }
        );
      } catch (error) {
        console.error('Failed to send reminder SMS:', error);
        results.sms = { error: error.message };
      }
    }

    return results;
  },

  formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  },

  getSMSCost(): number {
    return 0.0075;
  },

  getEmailCost(): number {
    return 0.0001;
  },
};
