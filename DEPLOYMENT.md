# Vercel + Neon Deployment Guide

## Quick Fix for "Registration Failed" Error

### Step 1: Create Database Tables in Neon

1. Open Neon Console → SQL Editor
2. Copy and paste the contents of `server/neon_init.sql`
3. Click "Run" to create the `users` table

### Step 2: Set Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables:

**Required Variables:**
- `DATABASE_URL` - Your Neon pooled connection string (with `?sslmode=require`)
- `JWT_SECRET` - Any long random string (e.g., `your-super-secret-jwt-key-here`)
- `GROQ_API_KEY` - Your Groq API key
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `REACT_APP_API_URL` - Set to `/api` (for same-domain API calls)

### Step 3: Verify Vercel Configuration

The project should have:
- **Root Directory**: `client` (in Vercel project settings)
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### Step 4: Test the API

After deploying, test the health endpoint:
```
https://ai-farming-seven.vercel.app/api/health
```

Should return: `{"status":"OK","message":"Appah Farms Knowledge Hub API is running"}`

### Step 5: Check Vercel Function Logs

If registration still fails:
1. Go to Vercel Dashboard → Your Project → Functions tab
2. Click on `api/auth/register`
3. Check the logs for errors (DATABASE_URL missing, connection errors, etc.)

### Common Issues:

1. **"DATABASE_URL is not set"** - Add it to Vercel environment variables
2. **"Table users does not exist"** - Run the SQL from `server/neon_init.sql` in Neon
3. **"Can't reach database"** - Check your Neon connection string uses the pooled endpoint
4. **CORS errors** - Shouldn't happen with same-domain `/api` calls

### Neon Connection String Format:

```
postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

Make sure to use the **pooled** connection (contains `-pooler` in the hostname).

