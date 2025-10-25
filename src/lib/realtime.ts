import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Job, Customer, Invoice, Activity, Notification } from './api';

type TableName = 'jobs' | 'customers' | 'invoices' | 'activities' | 'notifications';
type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionCallback<T> {
  (payload: RealtimePostgresChangesPayload<T>): void;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export function subscribeToTable<T>(
  table: TableName,
  event: ChangeEvent,
  callback: SubscriptionCallback<T>,
  filter?: string
): RealtimeChannel {
  const channelName = `${table}-changes-${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        filter,
      },
      callback
    )
    .subscribe();

  return channel;
}

export function subscribeToJobs(
  callback: (payload: RealtimePostgresChangesPayload<Job>) => void
): () => void {
  getCurrentUserId().then(userId => {
    if (!userId) return;

    const channel = subscribeToTable<Job>(
      'jobs',
      '*',
      callback,
      `user_id=eq.${userId}`
    );

    return () => {
      channel.unsubscribe();
    };
  });

  return () => {};
}

export function subscribeToCustomers(
  callback: (payload: RealtimePostgresChangesPayload<Customer>) => void
): () => void {
  getCurrentUserId().then(userId => {
    if (!userId) return;

    const channel = subscribeToTable<Customer>(
      'customers',
      '*',
      callback,
      `user_id=eq.${userId}`
    );

    return () => {
      channel.unsubscribe();
    };
  });

  return () => {};
}

export function subscribeToInvoices(
  callback: (payload: RealtimePostgresChangesPayload<Invoice>) => void
): () => void {
  getCurrentUserId().then(userId => {
    if (!userId) return;

    const channel = subscribeToTable<Invoice>(
      'invoices',
      '*',
      callback,
      `user_id=eq.${userId}`
    );

    return () => {
      channel.unsubscribe();
    };
  });

  return () => {};
}

export function subscribeToActivities(
  callback: (payload: RealtimePostgresChangesPayload<Activity>) => void,
  limit?: number
): () => void {
  getCurrentUserId().then(userId => {
    if (!userId) return;

    const channel = subscribeToTable<Activity>(
      'activities',
      'INSERT',
      callback,
      `user_id=eq.${userId}`
    );

    return () => {
      channel.unsubscribe();
    };
  });

  return () => {};
}

export function subscribeToNotifications(
  callback: (payload: RealtimePostgresChangesPayload<Notification>) => void
): () => void {
  getCurrentUserId().then(userId => {
    if (!userId) return;

    const channel = subscribeToTable<Notification>(
      'notifications',
      '*',
      callback,
      `user_id=eq.${userId}`
    );

    return () => {
      channel.unsubscribe();
    };
  });

  return () => {};
}

export function subscribeToJobUpdates(
  jobId: string,
  callback: (payload: RealtimePostgresChangesPayload<Job>) => void
): () => void {
  const channel = subscribeToTable<Job>(
    'jobs',
    'UPDATE',
    callback,
    `id=eq.${jobId}`
  );

  return () => {
    channel.unsubscribe();
  };
}

export function subscribeToInvoiceUpdates(
  invoiceId: string,
  callback: (payload: RealtimePostgresChangesPayload<Invoice>) => void
): () => void {
  const channel = subscribeToTable<Invoice>(
    'invoices',
    'UPDATE',
    callback,
    `id=eq.${invoiceId}`
  );

  return () => {
    channel.unsubscribe();
  };
}

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribe<T>(
    table: TableName,
    event: ChangeEvent,
    callback: SubscriptionCallback<T>,
    filter?: string
  ): string {
    const channelId = `${table}-${event}-${Date.now()}`;
    const channel = subscribeToTable<T>(table, event, callback, filter);
    this.channels.set(channelId, channel);
    return channelId;
  }

  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelId);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

export const realtimeManager = new RealtimeManager();
