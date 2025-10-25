import { supabase } from './supabase';
import { markFirstCustomer, markFirstProposal, markFirstInvoice } from './userProgress';

export const fn = (name: string) => `/functions/v1/${name}`;

const SIMULATE_DELAY = false;
const MIN_DELAY = 300;
const MAX_DELAY = 800;

const delay = () => {
  if (!SIMULATE_DELAY) return Promise.resolve();
  const ms = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
  return new Promise(resolve => setTimeout(resolve, ms));
};

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  customer_id: string;
  title: string;
  description?: string;
  address?: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'in-progress' | 'completed' | 'paid' | 'archived';
  price: number;
  ai_notes?: string;
  voice_transcript?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  signed_at?: string;
  completed_at?: string;
  customer?: Customer;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  job_id?: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
  subtotal: number;
  tax: number;
  total: number;
  due_date?: string;
  sent_at?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  job?: Job;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Activity {
  id: string;
  user_id: string;
  entity_type: 'job' | 'invoice' | 'customer';
  entity_id: string;
  action: string;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface Proposal {
  id: string;
  job_id: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed';
  sent_via?: string;
  pdf_url?: string;
  created_at: string;
}

export interface ScopeItem {
  id: string;
  job_id: string;
  category_id?: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProposalDetail {
  proposal: Proposal;
  job: Job;
  customer: Customer | null;
  items: ScopeItem[];
  summary: {
    subtotal: number;
  };
}

export const customersAPI = {
  async getAll(): Promise<Customer[]> {
    await delay();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Customer | null> {
    await delay();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    await delay();
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;

    await markFirstCustomer(customer.user_id, data.id, customer.name).catch(console.error);

    return data;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    await delay();
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const jobsAPI = {
  async getAll(): Promise<Job[]> {
    await delay();
    const { data, error } = await supabase
      .from('jobs')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Job | null> {
    await delay();
    const { data, error } = await supabase
      .from('jobs')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(job: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'customer'>): Promise<Job> {
    await delay();
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select('*, customer:customers(*)')
      .single();

    if (error) throw error;

    await markFirstProposal(job.user_id, data.id, job.title).catch(console.error);

    return data;
  },

  async update(id: string, updates: Partial<Job>): Promise<Job> {
    await delay();
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select('*, customer:customers(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const invoicesAPI = {
  async getAll(): Promise<Invoice[]> {
    await delay();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), job:jobs(*), items:invoice_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Invoice | null> {
    await delay();
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), job:jobs(*), items:invoice_items(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'customer' | 'job' | 'items'>): Promise<Invoice> {
    await delay();
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select('*, customer:customers(*), job:jobs(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    await delay();
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select('*, customer:customers(*), job:jobs(*), items:invoice_items(*)')
      .single();

    if (error) throw error;

    if (updates.sent_at && !data.sent_at) {
      await markFirstInvoice(data.user_id, data.id, data.invoice_number).catch(console.error);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createItems(items: Omit<InvoiceItem, 'id'>[]): Promise<InvoiceItem[]> {
    await delay();
    const { data, error } = await supabase
      .from('invoice_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data || [];
  },
};

export const activitiesAPI = {
  async getAll(limit = 50): Promise<Activity[]> {
    await delay();
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async create(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const notificationsAPI = {
  async getAll(): Promise<Notification[]> {
    await delay();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const proposalsAPI = {
  async getDetail(id: string): Promise<ProposalDetail> {
    await delay();

    const { data: proposal, error: pErr } = await supabase
      .from('proposals')
      .select('id, job_id, status, pdf_url, sent_via, created_at')
      .eq('id', id)
      .maybeSingle();

    if (pErr || !proposal) {
      throw new Error(pErr?.message || 'Proposal not found');
    }

    const { data: job, error: jErr } = await supabase
      .from('jobs')
      .select('id, title, status, customer_id, created_at')
      .eq('id', proposal.job_id)
      .maybeSingle();

    if (jErr || !job) {
      throw new Error(jErr?.message || 'Job not found');
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email, phone, address, city, state, zip')
      .eq('id', job.customer_id)
      .maybeSingle();

    const { data: items, error: iErr } = await supabase
      .from('scope_items')
      .select('id, job_id, category_id, description, unit, quantity, unit_price, total')
      .eq('job_id', job.id)
      .order('id', { ascending: true });

    if (iErr) {
      throw new Error(iErr.message);
    }

    const subtotal = Math.round((items ?? []).reduce((s, it) => s + (Number(it.total) || 0), 0) * 100) / 100;

    return {
      proposal,
      job,
      customer,
      items: items ?? [],
      summary: { subtotal }
    };
  },

  async updateStatus(id: string, status: Proposal['status']): Promise<Proposal> {
    await delay();
    const { data, error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async create(proposal: Omit<Proposal, 'id' | 'created_at'>): Promise<Proposal> {
    await delay();
    const { data, error } = await supabase
      .from('proposals')
      .insert(proposal)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
