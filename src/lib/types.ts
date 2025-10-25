export interface Customer {
  id: string;
  user_id: string;
  name: string;
  customer_type: 'individual' | 'business';
  first_name?: string;
  last_name?: string;
  business_name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  preferred_contact: 'sms' | 'email' | 'both';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  customer_id?: string;
  title?: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'in_progress' | 'completed';
  created_at: string;
}

export interface PricingCategory {
  id: string;
  user_id?: string;
  name: string;
  unit: 'sf' | 'lf' | 'ea' | 'room' | 'hr' | 'job' | 'sy' | 'cy' | 'point';
  rate: number;
  active: boolean;
}

export interface ScopeItem {
  id: string;
  job_id: string;
  category_id?: string;
  description?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Proposal {
  id: string;
  job_id: string;
  status: 'draft' | 'sent' | 'viewed' | 'signed';
  sent_via?: 'sms' | 'email';
  pdf_url?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  job_id: string;
  amount_cents: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'partially_paid';
  stripe_invoice_id?: string;
  due_date?: string;
}

export interface MediaPhoto {
  id: string;
  job_id: string;
  url: string;
  meta?: Record<string, any>;
}

export interface ContractorProfile {
  id: string;
  business_name: string;
  owner_name: string;
  phone_number: string;
  trade_type?: string;
  years_in_business?: string;
  team_size?: string;
  annual_revenue_range?: string;
  service_area_zipcode?: string;
  hourly_rate?: number;
  material_markup_percentage?: number;
  payment_terms?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScopeItemInput {
  categoryId?: string;
  description: string;
  unit: string;
  quantity?: number;
  unitPrice?: number;
}
