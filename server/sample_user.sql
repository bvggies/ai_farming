-- BETTER WAY: Use the registration API endpoint instead of SQL
-- But if you need SQL, first run: node server/generate_password_hash.js password123
-- Then use the hash it outputs in the INSERT below

-- Option 1: Delete existing test user and recreate via API
-- DELETE FROM users WHERE email = 'farmer@example.com';

-- Option 2: Insert user with manually generated hash
-- Run this in Node.js first to get the correct hash:
-- node server/generate_password_hash.js password123
-- Then copy the hash and use it below:

INSERT INTO users (
  name, 
  email, 
  password, 
  farm_size, 
  poultry_type, 
  preferred_language, 
  role, 
  is_active
) VALUES (
  'Test Farmer',
  'farmer@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Replace with hash from generate_password_hash.js
  'Small (50-200 birds)',
  'Layers',
  'en',
  'farmer',
  true
) ON CONFLICT (email) DO NOTHING;

-- Verify the user:
SELECT id, name, email, role, is_active, 
       CASE WHEN password LIKE '$2a$%' THEN 'Hashed' ELSE 'Not hashed' END as password_status
FROM users WHERE email = 'farmer@example.com';
