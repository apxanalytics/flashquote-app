/*
  # Add Customer Type and Enhanced Fields

  1. New Columns
    - `customer_type` (text): 'individual' or 'business', defaults to 'individual'
    - `first_name` (text): First name for individual customers
    - `last_name` (text): Last name for individual customers
    - `business_name` (text): Business name for business customers
    - `street` (text): Street address (rename from address)
    - `preferred_contact` (text): 'sms', 'email', or 'both', defaults to 'both'

  2. Changes
    - Add check constraints for customer_type and preferred_contact
    - Backfill existing customers with data from name column
    - Add index on customer_type for performance
    - Rename address to street for consistency

  3. Notes
    - Keeps name column for backward compatibility
    - DB remains flexible; validation happens at application layer
*/

-- Type + identity fields
alter table customers
  add column if not exists customer_type text check (customer_type in ('individual','business')) default 'individual',
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists business_name text;

-- Rename address to street for consistency (if needed)
alter table customers
  rename column address to street;

-- Preferred contact: 'sms' | 'email' | 'both'
alter table customers
  add column if not exists preferred_contact text check (preferred_contact in ('sms','email','both')) default 'both';

-- Backfill existing rows safely from name column
update customers
set first_name = coalesce(first_name, split_part(name, ' ', 1)),
    last_name  = coalesce(last_name, nullif(split_part(name, ' ', 2), ''))
where name is not null and first_name is null;

-- Make customer_type non-null after backfill
update customers set customer_type = 'individual' where customer_type is null;
alter table customers alter column customer_type set not null;

-- Make preferred_contact non-null
update customers set preferred_contact = 'both' where preferred_contact is null;
alter table customers alter column preferred_contact set not null;

-- Create index for performance
create index if not exists customers_type_idx on customers(customer_type);