import type { Customer, PricingCategory, CreateScopeItemInput } from './types';
import { supa } from './http';

export const supabase = supa;

export async function upsertCustomer({
  name,
  email,
  phone,
  address,
}: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}): Promise<Customer> {
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .maybeSingle();

  if (existing) return existing as Customer;

  const { data, error } = await supabase
    .from('customers')
    .insert([{ name, email, phone, address }])
    .select('*')
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function createJob(customerId: string, title = 'New Job') {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{ customer_id: customerId, title }])
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function listCategories(): Promise<PricingCategory[]> {
  const { data, error } = await supabase
    .from('pricing_categories')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data as PricingCategory[];
}

export async function saveScopeItems(jobId: string, items: CreateScopeItemInput[]) {
  const rows = items.map((it) => ({
    job_id: jobId,
    category_id: it.categoryId ?? null,
    description: it.description,
    unit: it.unit,
    quantity: it.quantity ?? 0,
    unit_price: it.unitPrice ?? 0,
  }));

  const { error } = await supabase.from('scope_items').insert(rows);
  if (error) throw error;
}

export async function createProposal(jobId: string, pdfUrl: string | null = null) {
  const { data, error } = await supabase
    .from('proposals')
    .insert([{ job_id: jobId, pdf_url: pdfUrl }])
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function uploadPhoto(jobId: string, file: File): Promise<string> {
  const fileName = `${jobId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function saveMediaPhotos(jobId: string, urls: string[]) {
  const rows = urls.map((url) => ({
    job_id: jobId,
    url,
  }));

  const { error } = await supabase.from('media_photos').insert(rows);
  if (error) throw error;
}
