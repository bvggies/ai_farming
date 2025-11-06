# Appah Farms Knowledge Hub

A comprehensive web application designed to help poultry farmers connect, share knowledge, and get AI-powered assistance for their farming needs.

## Features

### User Management
- ✅ User registration and profile creation
- ✅ Secure login system
- ✅ Profile management (farm size, poultry type, language preferences)

### Knowledge Sharing
- ✅ Post questions, tips, and experiences
- ✅ View, like, and comment on posts
- ✅ Upload images for discussion or AI analysis

### AI Assistance (Groq Integration)
- ✅ Chat with AI assistant for poultry farming advice
- ✅ Get recommendations on health, feeding, housing, and management
- ✅ Text summarization and translation support

### Knowledge Base
- ✅ Searchable database of common problems and FAQs
- ✅ Keyword-based search functionality
- ✅ AI-generated content recommendations

### Notifications
- ✅ Real-time notifications for post responses
- ✅ AI suggestion alerts

### Admin Panel
- ✅ User account management
- ✅ Content moderation
- ✅ Knowledge base management

## Technology Stack

### Backend
- Node.js with Express
- Postgres (Neon) with Prisma ORM
- JWT authentication
- Groq SDK for AI integration
- Multer for file uploads

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Simple, clean UI design

## Prerequisites

- Node.js (v14 or higher)
- Neon Postgres database (serverless Postgres)
- Groq API key (get one from https://console.groq.com/)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appah-farms-knowledge-hub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   GROQ_API_KEY=your_groq_api_key_here
   UPLOAD_DIR=./uploads
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Provision Neon Postgres**
   - Create a Neon project and database
   - Copy the connection string into `DATABASE_URL`
   - Run Prisma migration (first time):
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Run the application**

   Option 1: Run both frontend and backend together
   ```bash
   npm run dev
   ```

   Option 2: Run separately
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## First Admin User

To create an admin user, you can either:
1. Manually update a user in MongoDB to set `role: 'admin'`
2. Use MongoDB shell:
   ```javascript
   use appah_farms_knowledge_hub
   db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "admin" } })
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/summarize` - Summarize/translate text

### Knowledge Base
- `GET /api/knowledge` - Get all entries
- `GET /api/knowledge/search?q=query` - Search entries
- `GET /api/knowledge/:id` - Get single entry
- `POST /api/knowledge` - Create entry (admin only)
- `PUT /api/knowledge/:id` - Update entry (admin only)
- `DELETE /api/knowledge/:id` - Delete entry (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/posts` - Get all posts
- `PUT /api/admin/posts/:id/approve` - Approve/reject post
- `DELETE /api/admin/posts/:id` - Delete post
- `GET /api/admin/stats` - Get dashboard stats

## Project Structure

```
appah-farms-knowledge-hub/
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # Uploaded images
│   └── index.js         # Server entry point
├── client/
│   ├── public/         # Public assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── App.js      # Main app component
│   └── package.json
└── package.json
```

## Design Philosophy

The application is designed with simplicity in mind, making it accessible for farmers with limited technical knowledge:

- **Clean UI**: Simple, intuitive interface with clear navigation
- **Large Buttons**: Easy-to-click buttons and form fields
- **Clear Labels**: All fields and features have descriptive labels
- **Visual Feedback**: Clear success/error messages
- **Mobile-Friendly**: Responsive design that works on all devices

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Admin routes are protected
- File uploads are validated and limited to images

## Future Enhancements

- Email notifications
- SMS reminders for vaccination schedules
- Mobile app version
- Offline mode support
- Multi-language interface
- Advanced analytics dashboard

## License

MIT

## Support

For issues or questions, please contact the development team.

