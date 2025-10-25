import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
export type RealtimeTable = 'customers' | 'jobs' | 'invoices' | 'activities' | 'notifications';

interface SubscriptionCallbacks<T> {
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (record: T) => void;
  onChange?: (record: T, event: RealtimeEvent) => void;
}

export function subscribeToTable<T = any>(
  table: RealtimeTable,
  callbacks: SubscriptionCallbacks<T>,
  filter?: { column: string; value: string }
): RealtimeChannel {
  const channel = supabase.channel(`${table}-changes-${Date.now()}`);

  const subscriptionConfig: any = {
    event: '*',
    schema: 'public',
    table: table,
  };

  if (filter) {
    subscriptionConfig.filter = `${filter.column}=eq.${filter.value}`;
  }

  channel.on(
    'postgres_changes',
    subscriptionConfig,
    (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          callbacks.onInsert?.(newRecord as T);
          callbacks.onChange?.(newRecord as T, 'INSERT');
          break;
        case 'UPDATE':
          callbacks.onUpdate?.(newRecord as T);
          callbacks.onChange?.(newRecord as T, 'UPDATE');
          break;
        case 'DELETE':
          callbacks.onDelete?.(oldRecord as T);
          callbacks.onChange?.(oldRecord as T, 'DELETE');
          break;
      }
    }
  );

  channel.subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel): Promise<'ok' | 'timed out' | 'error'> {
  return supabase.removeChannel(channel);
}

export function createRealtimeHook<T>(table: RealtimeTable) {
  return function useRealtimeSubscription(
    callbacks: SubscriptionCallbacks<T>,
    filter?: { column: string; value: string },
    enabled: boolean = true
  ) {
    let channel: RealtimeChannel | null = null;

    if (enabled) {
      channel = subscribeToTable(table, callbacks, filter);
    }

    return () => {
      if (channel) {
        unsubscribe(channel);
      }
    };
  };
}

export const useRealtimeJobs = createRealtimeHook('jobs');
export const useRealtimeCustomers = createRealtimeHook('customers');
export const useRealtimeInvoices = createRealtimeHook('invoices');
export const useRealtimeActivities = createRealtimeHook('activities');
export const useRealtimeNotifications = createRealtimeHook('notifications');

export async function subscribeToPresence(
  channelName: string,
  userId: string,
  metadata: Record<string, any> = {}
) {
  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userId
      }
    }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence state:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...metadata
        });
      }
    });

  return channel;
}

export async function broadcastMessage(
  channelName: string,
  event: string,
  payload: any
) {
  const channel = supabase.channel(channelName);

  await channel.subscribe();

  await channel.send({
    type: 'broadcast',
    event,
    payload
  });

  await supabase.removeChannel(channel);
}
