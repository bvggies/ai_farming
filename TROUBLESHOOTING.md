# Troubleshooting Guide

## Registration/Login Failed - Step by Step Debug

### Step 1: Test Database Connection

Open in browser:
```
https://ai-farming-seven.vercel.app/api/test-db
```

**Expected response:**
```json
{
  "success": true,
  "database": {
    "connected": true,
    "users_table_exists": true,
    "user_count": 0
  },
  "environment": {
    "has_database_url": true,
    "has_jwt_secret": true
  }
}
```

**If you see errors:**
- `has_database_url: false` → Add `DATABASE_URL` to Vercel environment variables
- `users_table_exists: false` → Run `server/neon_init.sql` in Neon SQL Editor
- Connection errors → Check your Neon connection string

### Step 2: Verify Environment Variables in Vercel

Go to Vercel → Project → Settings → Environment Variables

**Required:**
- ✅ `DATABASE_URL` - Neon pooled connection string
- ✅ `JWT_SECRET` - Any random string
- ✅ `REACT_APP_API_URL` - Set to `/api`

**Optional (for later features):**
- `GROQ_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Step 3: Verify Database Schema

Run this in Neon SQL Editor:
```sql
-- Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;

-- If false, run server/neon_init.sql
```

### Step 4: Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Functions" tab
4. Click on `api/auth/register` or `api/auth/login`
5. Check "Logs" for errors

**Common errors:**
- `DATABASE_URL is not set` → Add env var
- `users table does not exist` → Run SQL schema
- `Can't reach database` → Check connection string
- `Invalid credentials` → Password hash mismatch (delete old user, use registration)

### Step 5: Test Registration via API Directly

Use curl or Postman:
```bash
curl -X POST https://ai-farming-seven.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**Expected response:**
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Step 6: Quick Fix Checklist

- [ ] Ran `server/neon_init.sql` in Neon SQL Editor
- [ ] Set `DATABASE_URL` in Vercel (with `?sslmode=require`)
- [ ] Set `JWT_SECRET` in Vercel
- [ ] Set `REACT_APP_API_URL=/api` in Vercel
- [ ] Redeployed Vercel after setting env vars
- [ ] Tested `/api/test-db` endpoint
- [ ] Checked Vercel function logs for errors

### Still Not Working?

1. **Share the exact error** from:
   - Browser console (F12 → Network tab → see failed request)
   - Vercel function logs

2. **Test the database connection**:
   - Run `/api/test-db` and share the response

3. **Verify Neon connection**:
   - Try connecting via Neon's built-in SQL editor
   - Make sure you're using the **pooled** connection string

