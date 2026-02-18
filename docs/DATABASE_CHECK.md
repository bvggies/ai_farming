# Database Connection Check Guide

## Step 1: Test Database Connection

Visit this URL in your browser:
```
https://ai-farming-seven.vercel.app/api/test-db
```

**Expected response (if connected):**
```json
{
  "success": true,
  "database": {
    "connected": true,
    "current_time": "2025-01-05T...",
    "database_name": "neondb",
    "users_table_exists": true,
    "user_count": 0
  },
  "environment": {
    "has_database_url": true,
    "has_jwt_secret": true,
    "node_env": "production"
  }
}
```

**If you see errors:**
- `has_database_url: false` → DATABASE_URL not set in Vercel
- `users_table_exists: false` → Run SQL schema in Neon
- `error: "..."` → Check the error message

## Step 2: Verify Vercel Environment Variables

Go to Vercel → Project → Settings → Environment Variables

**Required:**
- ✅ `DATABASE_URL` - Must be your Neon pooled connection string
  - Format: `postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require`
  - Must include `-pooler` in hostname
  - Must include `?sslmode=require`

- ✅ `JWT_SECRET` - Any random string

**After adding/updating:**
- Click **Save**
- Go to **Deployments** tab
- Click **Redeploy** (with "Clear build cache" checked)

## Step 3: Create Database Table in Neon

1. Open Neon Console: https://console.neon.tech/
2. Select your project
3. Click **SQL Editor**
4. Copy and paste the **entire contents** of `server/neon_init.sql`
5. Click **Run**

**Verify table was created:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;
```

Should return `true`.

## Step 4: Test Connection from Neon

In Neon SQL Editor, try:
```sql
SELECT NOW() as current_time, current_database() as db_name;
```

If this works, your database is accessible. The issue is likely the connection string format in Vercel.

## Step 5: Common Issues

### Issue: "DATABASE_URL is not set"
**Fix:** Add `DATABASE_URL` to Vercel environment variables

### Issue: "Table users does not exist"
**Fix:** Run `server/neon_init.sql` in Neon SQL Editor

### Issue: "Can't reach database server"
**Fix:** 
- Use the **pooled** connection string (contains `-pooler`)
- Make sure it includes `?sslmode=require`
- Verify the connection string in Neon Dashboard → Connection Details → **Prisma** format

### Issue: "Connection timeout"
**Fix:**
- Check if you're using the correct pooled endpoint
- Try adding `&connect_timeout=15` to the connection string
- Verify your Neon project is active (not paused)

## Quick Test Commands

**Test API endpoint:**
```bash
curl https://ai-farming-seven.vercel.app/api/test-db
```

**Test registration:**
```bash
curl -X POST https://ai-farming-seven.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123456"}'
```

## Next Steps After Connection Works

1. ✅ Database connected (`/api/test-db` shows success)
2. ✅ Table exists (`users_table_exists: true`)
3. ✅ Try registration at `/register` page
4. ✅ Try login at `/login` page

