-- SQL queries to verify and debug user login issues

-- 1. Check if user exists
SELECT id, name, email, role, is_active, LENGTH(password) as password_length FROM users WHERE email = 'farmer@example.com';

-- 2. Check all users
SELECT id, name, email, role, is_active FROM users;

-- 3. Delete test user if needed (to recreate)
-- DELETE FROM users WHERE email = 'farmer@example.com';

-- 4. Update user password with a new hash (replace with hash from generate_password_hash.js)
-- UPDATE users SET password = 'YOUR_NEW_HASH_HERE' WHERE email = 'farmer@example.com';

