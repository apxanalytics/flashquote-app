/*
  # Add Core Business Tables

  1. New Tables
    - `customers` - Store customer contact information
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, optional)
      - `phone` (text, optional)
      - `address` (text, optional)
      - `notes` (text, optional)
      - `created_at` (timestamptz)

    - `jobs` - Track customer jobs/projects
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key to customers)
      - `title` (text)
      - `status` (text, default 'draft')
      - `created_at` (timestamptz)

    - `pricing_categories` - Predefined pricing templates
      - `id` (uuid, primary key)
      - `user_id` (uuid, for multi-tenant support)
      - `name` (text, required)
      - `unit` (text, required - sf/lf/ea/room/hr/job/sy/cy/point)
      - `rate` (numeric, required)
      - `active` (boolean, default true)

    - `scope_items` - Individual line items for jobs
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `category_id` (uuid, foreign key to pricing_categories)
      - `description` (text)
      - `unit` (text, required)
      - `quantity` (numeric, default 0)
      - `unit_price` (numeric, default 0)
      - `total` (numeric, computed as quantity * unit_price)

    - `proposals` - Job proposals sent to customers
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `status` (text, default 'draft')
      - `sent_via` (text - sms/email/null)
      - `pdf_url` (text)
      - `created_at` (timestamptz)

    - `invoices` - Payment invoices
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `amount_cents` (int, required)
      - `status` (text, default 'draft')
      - `stripe_invoice_id` (text, optional)
      - `due_date` (date)

    - `media_photos` - Job photos and media
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `url` (text, required)
      - `meta` (jsonb)

  2. Security
    - Tables created without RLS initially
    - RLS policies will be added in subsequent migration
*/

-- CUSTOMERS ---------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

-- JOBS --------------------------------------------------------------------
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  title text,
  status text default 'draft',  -- draft|sent|viewed|signed|in_progress|completed
  created_at timestamptz default now()
);

-- PRICING CATEGORIES ------------------------------------------------------
create table if not exists pricing_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                 -- keep null if you're not multi-tenant yet
  name text not null,           -- 'Paint', 'Flooring', etc.
  unit text not null,           -- 'sf'|'lf'|'ea'|'room'|'hr'|'job'|'sy'|'cy'|'point'
  rate numeric not null,
  active boolean default true
);

-- SCOPE ITEMS -------------------------------------------------------------
create table if not exists scope_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  category_id uuid references pricing_categories(id),
  description text,
  unit text not null,
  quantity numeric default 0,
  unit_price numeric default 0,
  total numeric generated always as (quantity * unit_price) stored
);

-- PROPOSALS ---------------------------------------------------------------
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  status text default 'draft',  -- draft|sent|viewed|signed
  sent_via text,                -- 'sms'|'email'|null
  pdf_url text,
  created_at timestamptz default now()
);

-- INVOICES ---------------------------------------------------------------
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  amount_cents int not null,
  status text default 'draft',  -- draft|sent|paid|overdue|partially_paid
  stripe_invoice_id text,
  due_date date
);

-- PHOTOS -----------------------------------------------------------------
create table if not exists media_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  url text not null,
  meta jsonb
);
