# Quick Setup Guide

Follow these steps to get your AI Farming application running:

## Step 1: Install Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root package (concurrently)
- Server (Express, MongoDB, etc.)
- Client (React, etc.)

## Step 2: Set Up Neon Postgres

1. Create a database at https://neon.tech/
2. Copy the connection string and set it as `DATABASE_URL` in `server/.env` (use `sslmode=require`)
3. Initialize Prisma
```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

## Step 3: Configure Environment Variables

### Server Configuration

Create a file `server/.env` with the following:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
GROQ_API_KEY=your_groq_api_key_here
UPLOAD_DIR=./uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:**
- Replace `MONGODB_URI` with your MongoDB connection string (use MongoDB Atlas connection string if using cloud)
- Replace `JWT_SECRET` with a random secure string (you can generate one)
- Get your Groq API key from: https://console.groq.com/
- Create the `server/uploads` directory manually if it doesn't exist

### Client Configuration

Create a file `client/.env` with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If you're deploying or using a different port, update this accordingly.

## Step 4: Create Upload Directory

```bash
mkdir server/uploads
```

This directory will store uploaded images locally (development). In production, images are uploaded to Cloudinary.

## Step 5: Start the Application

### Development Mode (Recommended)

This starts both frontend and backend together:

```bash
npm run dev
```

### Or Start Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## Step 7: Create Your First Account

1. Go to http://localhost:3000
2. Click "Register here" or go to http://localhost:3000/register
3. Fill in your details and create an account

## Step 8: Create Admin User (Optional)

To create an admin user, use MongoDB shell or MongoDB Compass:

```javascript
use aifarming
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass:
1. Connect to your database
2. Find the `users` collection
3. Find your user document
4. Change `role` from `"farmer"` to `"admin"`

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `server/.env`
- For MongoDB Atlas, make sure your IP is whitelisted

### Groq API Error
- Make sure you have a valid API key in `server/.env`
- Check your Groq account has credits/quota

### Port Already in Use
- Change `PORT` in `server/.env` to a different port (e.g., 5001)
- Update `REACT_APP_API_URL` in `client/.env` accordingly

### Image Upload Not Working
- Make sure `server/uploads` directory exists
- Check file permissions

### CORS Errors
- Make sure backend is running before frontend
- Check that API URL in client matches backend port

## Next Steps After Setup

1. **Test the Features:**
   - Create a post with images
   - Try the AI chat assistant
   - Search the knowledge base
   - Test notifications

2. **Add Initial Knowledge Base Content:**
   - Log in as admin
   - Go to Admin Panel
   - Add some helpful articles to the knowledge base

3. **Customize:**
   - Update colors/branding in `client/src/App.css`
   - Add more languages in registration/profile
   - Customize AI prompts in `server/routes/ai.js`

## Need Help?

- Check the main README.md for detailed documentation
- Review error messages in the console
- Check server logs for backend errors

