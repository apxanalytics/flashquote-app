import { supabase } from './supabase';
import { Customer, Job, Invoice, InvoiceItem, Activity, Notification } from './api';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Database operation failed:', error);

    if (error.code === 'PGRST116') {
      throw new DatabaseError('Record not found', '404', error);
    } else if (error.code === '23505') {
      throw new DatabaseError('This record already exists', '409', error);
    } else if (error.code === '23503') {
      throw new DatabaseError('Cannot delete - record is in use', '409', error);
    } else if (error.message?.includes('JWT') || error.message?.includes('expired')) {
      throw new DatabaseError('Your session has expired. Please log in again.', '401', error);
    } else if (error.message?.includes('permission')) {
      throw new DatabaseError('You do not have permission to perform this action', '403', error);
    } else {
      throw new DatabaseError(
        error.message || 'Something went wrong. Please try again.',
        '500',
        error
      );
    }
  }
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new DatabaseError('Not authenticated', '401');
  return user.id;
}

export const database = {
  customers: {
    async getAll(filters: { search?: string } = {}): Promise<Customer[]> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        let query = supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      });
    },

    async getById(id: string): Promise<Customer> {
      return handleDatabaseOperation(async () => {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new DatabaseError('Customer not found', 'PGRST116');
        return data;
      });
    },

    async create(customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        const fullName = customerData.customer_type === 'business'
          ? (customerData.business_name || '')
          : `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();

        const { data, error } = await supabase
          .from('customers')
          .insert({
            user_id: userId,
            ...customerData,
            name: fullName
          })
          .select()
          .single();

        if (error) throw error;

        await database.activities.log({
          entity_type: 'customer',
          entity_id: data.id,
          action: 'customer_created',
          description: `Customer created: ${fullName}`
        });

        return data;
      });
    },

    async update(id: string, updates: Partial<Customer>): Promise<Customer> {
      return handleDatabaseOperation(async () => {
        const updateData = { ...updates };

        if (updates.customer_type || updates.first_name || updates.last_name || updates.business_name) {
          const current = await database.customers.getById(id);
          const type = updates.customer_type || current.customer_type;
          const fullName = type === 'business'
            ? (updates.business_name ?? current.business_name ?? '')
            : `${updates.first_name ?? current.first_name ?? ''} ${updates.last_name ?? current.last_name ?? ''}`.trim();
          updateData.name = fullName;
        }

        const { data, error } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        await database.activities.log({
          entity_type: 'customer',
          entity_id: id,
          action: 'customer_updated',
          description: `Customer updated: ${data.name}`
        });

        return data;
      });
    },

    async delete(id: string): Promise<void> {
      return handleDatabaseOperation(async () => {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await database.activities.log({
          entity_type: 'customer',
          entity_id: id,
          action: 'customer_deleted',
          description: 'Customer deleted'
        });
      });
    }
  },

  jobs: {
    async getAll(filters: { status?: string; search?: string } = {}): Promise<Job[]> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        let query = supabase
          .from('jobs')
          .select('*, customer:customers(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      });
    },

    async getById(id: string): Promise<Job> {
      return handleDatabaseOperation(async () => {
        const { data, error } = await supabase
          .from('jobs')
          .select('*, customer:customers(*)')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new DatabaseError('Job not found', 'PGRST116');
        return data;
      });
    },

    async create(jobData: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Job> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
          .from('jobs')
          .insert({
            user_id: userId,
            ...jobData
          })
          .select('*, customer:customers(*)')
          .single();

        if (error) throw error;

        await database.activities.log({
          entity_type: 'job',
          entity_id: data.id,
          action: 'job_created',
          description: `Job created: ${jobData.title}`
        });

        return data;
      });
    },

    async update(id: string, updates: Partial<Job>): Promise<Job> {
      return handleDatabaseOperation(async () => {
        const { data, error } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', id)
          .select('*, customer:customers(*)')
          .single();

        if (error) throw error;

        await database.activities.log({
          entity_type: 'job',
          entity_id: id,
          action: 'job_updated',
          description: `Job updated: ${data.title}`
        });

        return data;
      });
    },

    async updateStatus(id: string, status: Job['status'], metadata?: Record<string, any>): Promise<Job> {
      return handleDatabaseOperation(async () => {
        const updates: any = { status };

        if (status === 'sent') {
          updates.sent_at = new Date().toISOString();
        } else if (status === 'signed') {
          updates.signed_at = new Date().toISOString();
        } else if (status === 'completed') {
          updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', id)
          .select('*, customer:customers(*)')
          .single();

        if (error) throw error;

        await database.activities.log({
          entity_type: 'job',
          entity_id: id,
          action: `job_${status}`,
          description: `Job status changed to ${status}`
        });

        return data;
      });
    },

    async delete(id: string): Promise<void> {
      return handleDatabaseOperation(async () => {
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await database.activities.log({
          entity_type: 'job',
          entity_id: id,
          action: 'job_deleted',
          description: 'Job deleted'
        });
      });
    }
  },

  invoices: {
    async getAll(filters: { status?: string } = {}): Promise<Invoice[]> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        let query = supabase
          .from('invoices')
          .select('*, customer:customers(*), job:jobs(*), items:invoice_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      });
    },

    async getById(id: string): Promise<Invoice> {
      return handleDatabaseOperation(async () => {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, customer:customers(*), job:jobs(*), items:invoice_items(*)')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new DatabaseError('Invoice not found', 'PGRST116');
        return data;
      });
    },

    async create(invoiceData: Omit<Invoice, 'id' | 'user_id' | 'invoice_number' | 'created_at' | 'updated_at'> & { items: Omit<InvoiceItem, 'id' | 'invoice_id'>[] }): Promise<Invoice> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        const { count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const invoiceNumber = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

        const { items, ...invoiceDetails } = invoiceData;

        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            invoice_number: invoiceNumber,
            ...invoiceDetails
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        if (items && items.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(items.map(item => ({ ...item, invoice_id: invoice.id })));

          if (itemsError) throw itemsError;
        }

        await database.activities.log({
          entity_type: 'invoice',
          entity_id: invoice.id,
          action: 'invoice_created',
          description: `Invoice ${invoiceNumber} created`
        });

        return await database.invoices.getById(invoice.id);
      });
    },

    async updateStatus(id: string, status: Invoice['status']): Promise<Invoice> {
      return handleDatabaseOperation(async () => {
        const updates: any = { status };

        if (status === 'sent') {
          updates.sent_at = new Date().toISOString();
        } else if (status === 'paid') {
          updates.paid_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('invoices')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        await database.activities.log({
          entity_type: 'invoice',
          entity_id: id,
          action: `invoice_${status}`,
          description: `Invoice status changed to ${status}`
        });

        return await database.invoices.getById(id);
      });
    }
  },

  activities: {
    async log(activityData: Omit<Activity, 'id' | 'user_id' | 'created_at'>): Promise<void> {
      try {
        const userId = await getCurrentUserId();

        await supabase.from('activities').insert({
          user_id: userId,
          ...activityData
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    },

    async getRecent(limit = 50): Promise<Activity[]> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      });
    },

    async getByEntity(entityType: string, entityId: string): Promise<Activity[]> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      });
    }
  },

  notifications: {
    async getAll(includeRead = false): Promise<Notification[]> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        let query = supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!includeRead) {
          query = query.eq('read', false);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      });
    },

    async markAsRead(id: string): Promise<void> {
      return handleDatabaseOperation(async () => {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id);

        if (error) throw error;
      });
    },

    async markAllAsRead(): Promise<void> {
      return handleDatabaseOperation(async () => {
        const userId = await getCurrentUserId();

        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('read', false);

        if (error) throw error;
      });
    }
  }
};

export default database;
