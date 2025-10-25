import { supabase } from './supabase';

export interface UserSettings {
  user_id: string;
  checklist_skipped: boolean;
  checklist_completed_at?: string;
  has_business_profile: boolean;
  has_first_proposal: boolean;
  has_first_invoice: boolean;
  has_first_customer: boolean;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  type: string;
  ref_id?: string;
  title: string;
  created_at: string;
}

async function ensureUserSettings(userId: string): Promise<void> {
  const { data } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    await supabase
      .from('user_settings')
      .insert({ user_id: userId });
  }
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  await ensureUserSettings(userId);

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  await ensureUserSettings(userId);

  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function logActivity(
  userId: string,
  type: string,
  title: string,
  refId?: string
): Promise<void> {
  await supabase
    .from('activity_log')
    .insert({
      user_id: userId,
      type,
      title,
      ref_id: refId,
    });
}

export async function getRecentActivity(
  userId: string,
  limit = 10
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function markBusinessProfileComplete(userId: string): Promise<void> {
  await updateUserSettings(userId, { has_business_profile: true });
  await logActivity(userId, 'profile_completed', 'Business profile completed');
}

export async function markFirstProposal(
  userId: string,
  proposalId: string,
  title: string
): Promise<void> {
  const settings = await getUserSettings(userId);

  if (!settings?.has_first_proposal) {
    await updateUserSettings(userId, { has_first_proposal: true });
  }

  await logActivity(userId, 'proposal_created', title, proposalId);
}

export async function markProposalSent(
  userId: string,
  proposalId: string,
  title: string
): Promise<void> {
  await logActivity(userId, 'proposal_sent', `Proposal sent: ${title}`, proposalId);
}

export async function markFirstCustomer(
  userId: string,
  customerId: string,
  name: string
): Promise<void> {
  const settings = await getUserSettings(userId);

  if (!settings?.has_first_customer) {
    await updateUserSettings(userId, { has_first_customer: true });
  }

  await logActivity(userId, 'customer_added', `New customer: ${name}`, customerId);
}

export async function markFirstInvoice(
  userId: string,
  invoiceId: string,
  invoiceNumber: string
): Promise<void> {
  const settings = await getUserSettings(userId);

  if (!settings?.has_first_invoice) {
    await updateUserSettings(userId, { has_first_invoice: true });
  }

  await logActivity(userId, 'invoice_sent', `Invoice ${invoiceNumber} sent`, invoiceId);
}

export async function markInvoicePaid(
  userId: string,
  invoiceId: string,
  invoiceNumber: string,
  amount: number
): Promise<void> {
  await logActivity(
    userId,
    'payment_received',
    `Payment received: $${amount.toLocaleString()} (Invoice ${invoiceNumber})`,
    invoiceId
  );
}

export async function dismissChecklist(userId: string): Promise<void> {
  await updateUserSettings(userId, { checklist_skipped: true });
}

export async function markChecklistComplete(userId: string): Promise<void> {
  await updateUserSettings(userId, {
    checklist_completed_at: new Date().toISOString(),
  });
}
