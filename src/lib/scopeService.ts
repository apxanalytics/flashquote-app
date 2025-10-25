import type { PricingCategory } from './types';

export interface GeneratedScopeItem {
  description: string;
  categoryId?: string | null;
  unit: PricingCategory['unit'];
  quantity: number;
  unitPrice: number;
  total?: number;
  reasoning?: string;
}

export async function generateScope(
  transcript: string,
  categories: PricingCategory[]
): Promise<GeneratedScopeItem[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/scope-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      transcript,
      categories,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Scope generation failed' }));
    throw new Error(error.error || 'Scope generation failed');
  }

  const { items } = await response.json();
  return items as GeneratedScopeItem[];
}
