# LearnHub Setup Guide

Complete setup instructions for the advanced gamification platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v5.0 or higher)
  - Local installation OR
  - MongoDB Atlas account (cloud database)

## Quick Start

### 1. Clone and Install

```bash
# Navigate to project directory
cd gamification

# Install all dependencies (root, frontend, and backend)
npm run install:all
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition:
   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - **Mac**: `brew install mongodb-community`
   - **Linux**: Follow official guide

2. Start MongoDB:
   ```bash
   # Windows (as service - already running after install)
   # Mac/Linux
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Get your connection string
4. Whitelist your IP address
5. Create a database user

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database - Choose one:
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/learnhub-gamification

# MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learnhub?retryWrites=true&w=majority

# JWT Secret (IMPORTANT: Change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Security Note**: Generate a secure JWT_SECRET:
```bash
# Generate random secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start the Application

#### Development Mode (Recommended)

Open TWO terminal windows:

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

#### Alternative: Run Both Simultaneously

From the root directory:
```bash
npm run dev
```

This runs both frontend and backend concurrently.

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## First Time Setup

### Create Your First Account

1. Click "Register" on the login page
2. Fill in:
   - Email: your@email.com
   - Username: your_username
   - Password: (minimum 6 characters)
3. Click "Create Account"

Upon registration, a character profile is automatically created with:
- Level 1
- Starting XP: 0
- All 12 attributes initialized at 5.0
- Default avatar
- Title: "Novice Explorer"

### Explore the Platform

After logging in, you'll see:
1. **Dashboard** - Overview of your progress
2. **Character** - View your 12-attribute radar chart
3. **Expedition** - Interactive mountain map (A.R.I.S.E.)
4. **Cards** - Digital collectible cards
5. **Badges** - Achievement system (Bronze/Silver/Gold)
6. **Profile** - Account settings

## Project Structure

```
gamification/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── character/ # Radar charts, avatars
│   │   │   ├── expedition/# Mountain maps, checkpoints
│   │   │   ├── cards/     # Trading card system
│   │   │   ├── badges/    # Badge displays
│   │   │   ├── shared/    # Common components
│   │   │   └── layout/    # Layout components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand state management
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript definitions
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global CSS
│   └── package.json
│
├── backend/               # Express + TypeScript + MongoDB
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, error handling
│   │   ├── utils/         # Utilities
│   │   └── server.ts      # Entry point
│   └── package.json
│
└── package.json           # Root workspace config
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Character
- `GET /api/character/attributes` - Get character data
- `PUT /api/character/attributes` - Update attributes
- `GET /api/character/avatar` - Get avatar
- `PUT /api/character/avatar` - Update avatar
- `POST /api/character/xp` - Add XP

### Mountains (Mock Data - Phase 1)
- `GET /api/mountains` - Get all mountains
- `GET /api/mountains/progress` - Get progress
- `POST /api/mountains/checkpoint` - Complete checkpoint

### Cards (Mock Data - Phase 1)
- `GET /api/cards` - Get all cards
- `GET /api/cards/collection` - Get user's cards
- `POST /api/cards/assign` - Assign card to peer

### Badges (Mock Data - Phase 1)
- `GET /api/badges` - Get all badges
- `GET /api/badges/user` - Get user badges
- `GET /api/achievements/timeline` - Get achievement history

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongooseServerSelectionError`

**Solutions**:
1. Ensure MongoDB is running:
   ```bash
   # Check if mongod process is running
   # Windows: Task Manager > Services > MongoDB
   # Mac/Linux:
   ps aux | grep mongod
   ```

2. Test connection:
   ```bash
   # Using mongosh (MongoDB Shell)
   mongosh "mongodb://localhost:27017/learnhub-gamification"
   ```

3. Check firewall settings (MongoDB uses port 27017)

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solutions**:
1. Kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

2. Or change the port in `backend/.env`:
   ```env
   PORT=5001
   ```

### CORS Issues

**Error**: `Access-Control-Allow-Origin`

**Solution**: Ensure `backend/.env` has correct frontend URL:
```env
CORS_ORIGIN=http://localhost:3000
```

### TypeScript Compilation Errors

**Solutions**:
```bash
# Clean install
cd frontend  # or backend
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
rm -rf .tsbuildinfo
```

## Development Workflow

### Making Code Changes

1. **Frontend changes**: Hot reload is automatic (Vite)
2. **Backend changes**: Server auto-restarts (tsx watch)
3. **Model changes**: Restart backend server

### Testing API Endpoints

Use tools like:
- **Postman** - https://www.postman.com/
- **Thunder Client** (VS Code extension)
- **curl** (command line)

Example API test:
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get character (use token from login)
curl http://localhost:5000/api/character/attributes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Backend

```bash
cd backend
npm run build
```

Output: `backend/dist/`

### Production Environment Variables

Update `backend/.env` for production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...  # Use Atlas in production
JWT_SECRET=<very-secure-random-string-64-chars-plus>
CORS_ORIGIN=https://your-production-domain.com
```

## Next Steps

### Phase 2 Features (Upcoming)

- Peer assessment dashboard
- Drag-and-drop card assignments
- Complete mountain checkpoint system
- Learning modules (60-90 second micro-learning)

### Phase 3 Features (Future)

- 3D isometric mountain visualization
- Trading card marketplace
- Team-based expeditions
- AI-powered learning recommendations

## Support

For issues or questions:
- Check the README.md
- Review this SETUP.md
- Check backend logs
- Check browser console (F12)

## Security Notes

- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Change default credentials immediately
- Use MongoDB Atlas with IP whitelisting in production
- Enable HTTPS in production
- Regularly update dependencies

---

Built with ❤️ for next-generation learning
