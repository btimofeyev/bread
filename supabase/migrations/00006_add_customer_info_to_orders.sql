-- Add customer information directly to orders table
-- This avoids the profile RLS policy issue while still capturing customer data

ALTER TABLE orders ADD COLUMN customer_name text;
ALTER TABLE orders ADD COLUMN customer_phone text;