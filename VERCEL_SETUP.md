# Vercel Setup Instructions

## Critical Vercel Project Settings

### Step 1: Root Directory Setting

**IMPORTANT:** In Vercel project settings:

1. Go to **Settings → General**
2. **DO NOT set a Root Directory** (leave it blank/empty)
   - ❌ Wrong: Root Directory = `client`
   - ✅ Correct: Root Directory = (empty/blank)

If you set Root Directory to `client`, Vercel won't see the `/api` folder at the root level!

### Step 2: Framework Preset

- **Framework Preset:** Other (or leave auto-detect)
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/build`

### Step 3: Environment Variables

Add these in **Settings → Environment Variables:**

- `DATABASE_URL` - Your Neon pooled connection string
- `JWT_SECRET` - Any random string
- `REACT_APP_API_URL` - `/api`
- `GROQ_API_KEY` - (optional, for AI features)
- `CLOUDINARY_*` - (optional, for image uploads)

### Step 4: Deploy

After setting Root Directory to empty:
1. Click **Redeploy**
2. Clear build cache
3. Wait for deployment

### Step 5: Test

Visit: `https://ai-farming-seven.vercel.app/api/health`

Should return JSON, not a blank page.

## If API Still Shows Blank Page

1. **Check Vercel Functions tab:**
   - Go to your project → Functions
   - You should see `api/health.js`, `api/auth/register.js`, etc.
   - If missing → Root Directory is set incorrectly

2. **Check build logs:**
   - Look for errors about missing `/api` folder
   - Check if dependencies are installed

3. **Verify file structure:**
   ```
   your-repo/
   ├── api/
   │   ├── _db.js
   │   ├── health.js
   │   ├── test-db.js
   │   └── auth/
   ├── client/
   │   └── ...
   └── vercel.json
   ```

