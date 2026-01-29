# 🚂 Railway Deployment Guide for LearnHub

This guide will help you deploy your complete LearnHub gamification platform to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Railway CLI** (optional): `npm i -g @railway/cli`

## 🏗️ Architecture Overview

We'll deploy:
1. **MySQL Database** - Railway MySQL service
2. **Backend API** - Node.js/Express server
3. **Frontend** - React application (via Vite)

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Project

#### 1.1 Update Backend Package.json

Ensure your `backend/package.json` has the correct scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "npm run build",
    "db:init": "tsx src/scripts/initDatabase.ts",
    "db:add-culture-quest": "tsx src/scripts/addCultureQuest.ts",
    "db:add-levio": "tsx src/scripts/addLevioFeatures.ts"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 1.2 Create Backend Procfile (Optional)

Create `backend/Procfile`:
```
web: npm start
```

#### 1.3 Update Frontend Build Configuration

Ensure `frontend/vite.config.ts` is configured:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

#### 1.4 Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

### Step 2: Create New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `gamification` repository

---

### Step 3: Add MySQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add MySQL"**
4. Railway will provision a MySQL database
5. Note down the connection details (or use the provided DATABASE_URL)

---

### Step 4: Deploy Backend

#### 4.1 Add Backend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Click on the new service
4. Go to **"Settings"**
5. Set **Root Directory**: `backend`
6. Set **Build Command**: `npm install && npm run build`
7. Set **Start Command**: `npm start`

#### 4.2 Configure Environment Variables

Click on **"Variables"** tab and add:

```bash
# Database (use Railway's MySQL connection)
DATABASE_URL=${{MySQL.DATABASE_URL}}
# Or individually:
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=https://your-frontend-url.railway.app
```

**Important Notes:**
- Replace `JWT_SECRET` with a strong random string
- Update `CORS_ORIGIN` after deploying frontend (Step 5)
- Railway provides MySQL connection variables automatically

#### 4.3 Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)

#### 4.4 Initialize Database

**Option A: Using Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run database init
railway run npm run db:init

# Add Culture Quest features
railway run npm run db:add-culture-quest

# Add Levio features
railway run npm run db:add-levio
```

**Option B: Modify server.ts to auto-initialize**

Add to `backend/src/server.ts`:

```typescript
const startServer = async () => {
  await connectDB();

  // Auto-initialize database in production (first time only)
  if (process.env.NODE_ENV === 'production' && process.env.AUTO_INIT_DB === 'true') {
    console.log('🔧 Running database initialization...');
    try {
      // Import and run init scripts
      await import('./scripts/initDatabase.js');
      await import('./scripts/addCultureQuest.js');
      await import('./scripts/addLevioFeatures.js');
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};
```

Then add environment variable: `AUTO_INIT_DB=true` (set to `false` after first run)

---

### Step 5: Deploy Frontend

#### 5.1 Add Frontend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Click on the service
4. Go to **"Settings"**
5. Set **Root Directory**: `frontend`
6. Set **Build Command**: `npm install && npm run build`
7. Set **Start Command**: `npm run preview` or use a static server

#### 5.2 Better Option: Use Static Hosting

**Create `frontend/package.json` script:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0 --port $PORT",
    "serve": "serve -s dist -l $PORT"
  },
  "devDependencies": {
    "serve": "^14.2.0"
  }
}
```

**Railway Settings:**
- Build Command: `npm install && npm run build`
- Start Command: `npm run serve`

#### 5.3 Configure Environment Variables

Click on **"Variables"** tab and add:

```bash
# API URL (use your backend domain from Step 4.3)
VITE_API_URL=https://backend-production-xxxx.up.railway.app

# Optional
NODE_ENV=production
```

#### 5.4 Update API Service

Create `frontend/src/services/api.ts` (if not exists):

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### 5.5 Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

#### 5.6 Update Backend CORS

Go back to **Backend service** → **Variables**:
```bash
CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app
```

Redeploy backend for changes to take effect.

---

### Step 6: Verify Deployment

1. **Visit Frontend URL**: `https://frontend-production-xxxx.up.railway.app`
2. **Test Registration**: Create a new account
3. **Test Login**: Sign in with your account
4. **Check Features**:
   - Character creation
   - Expedition map
   - Lessons
   - Missions
   - Social feed
   - Reward shop
   - Notifications

---

## 🔧 Railway Configuration Files

### Create `railway.json` in project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Create `railway.toml` for backend:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## 💰 Pricing Information

Railway offers:
- **Free Trial**: $5 credit (requires credit card)
- **Developer Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

**Estimated Monthly Cost** (for this app):
- MySQL Database: ~$5-10
- Backend Service: ~$5-10
- Frontend Service: ~$5
- **Total**: ~$15-25/month

---

## 🔒 Security Best Practices

### 1. Environment Variables

Never commit sensitive data:

**Create `.env.example`:**
```bash
# Database
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=learnhub_gamification

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend-url.railway.app
```

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. JWT Secret

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Database Backups

Railway provides automatic backups for MySQL. Configure in:
- Dashboard → MySQL → Backups

### 4. Rate Limiting

Already implemented in your backend with helmet and other security middleware.

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing dependencies: Run `npm install` locally first
- TypeScript errors: Run `npm run build` locally to test
- Wrong Node version: Set in `package.json` engines

### Database Connection Issues

**Check connection string:**
```bash
# In Railway dashboard, click MySQL → Connect
# Use the connection details provided
```

**Test connection:**
```typescript
// Add to your database.ts
console.log('Attempting to connect to:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});
```

### CORS Errors

**Update backend CORS configuration:**
```typescript
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

### Frontend Can't Connect to Backend

**Check API URL:**
1. Ensure `VITE_API_URL` is set correctly
2. Verify backend is running (check Railway logs)
3. Test backend directly: `https://your-backend.railway.app/health`

### Database Not Initialized

**Option 1: Use Railway CLI**
```bash
railway link
railway run npm run db:init
railway run npm run db:add-culture-quest
railway run npm run db:add-levio
```

**Option 2: Create endpoint**
```typescript
// backend/src/routes/adminRoutes.ts
app.post('/api/admin/init-db', authenticateToken, async (req, res) => {
  // Add admin check
  try {
    await import('./scripts/initDatabase.js');
    await import('./scripts/addCultureQuest.js');
    await import('./scripts/addLevioFeatures.js');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Call this endpoint once after deployment.

---

## 📊 Monitoring

### Railway Dashboard

Monitor your services:
1. **Metrics**: CPU, Memory, Network usage
2. **Logs**: Real-time application logs
3. **Deployments**: View deployment history
4. **Build times**: Optimize slow builds

### Add Health Check Endpoint

Already exists in `backend/src/server.ts`:
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Set Up Alerts

Railway can notify you:
- Deployment failures
- High resource usage
- Service crashes

Configure in: Dashboard → Settings → Notifications

---

## 🔄 CI/CD (Continuous Deployment)

Railway automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Railway will automatically:
# 1. Detect the push
# 2. Build your application
# 3. Deploy if build succeeds
# 4. Rollback if deployment fails
```

### Disable Auto-Deploy

If you want manual deployments:
1. Go to service settings
2. Disable "Auto Deploy"
3. Deploy manually from Railway dashboard

---

## 🌍 Custom Domain (Optional)

### Add Custom Domain

1. Go to service → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Configure DNS:
   - **CNAME**: Point to Railway's provided domain
   - **A Record**: Use Railway's IP address

### SSL Certificate

Railway automatically provisions SSL certificates for custom domains using Let's Encrypt.

---

## 📈 Scaling

### Vertical Scaling (More Resources)

Railway automatically scales resources based on usage.

### Horizontal Scaling (Multiple Instances)

Upgrade to Pro plan:
1. Go to service settings
2. Increase **"Replicas"**
3. Railway will load balance across instances

**Note**: Ensure your app is stateless for horizontal scaling.

---

## 💾 Database Management

### Access MySQL

**Option 1: Railway CLI**
```bash
railway connect MySQL
```

**Option 2: External MySQL Client**
Use connection details from Railway dashboard:
- Host
- Port
- Username
- Password
- Database

**Option 3: phpMyAdmin (Deploy Separately)**
Deploy phpMyAdmin as another service in Railway.

---

## 🎯 Deployment Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database initialized with all tables
- [ ] Sample data added (or removed for production)
- [ ] JWT secret is strong and unique
- [ ] CORS configured with frontend URL
- [ ] Health check endpoint working
- [ ] All API endpoints tested
- [ ] Frontend connects to backend successfully
- [ ] Authentication flow works
- [ ] Character creation works
- [ ] Lessons, missions, social features tested
- [ ] SSL certificate active
- [ ] Monitoring and alerts configured
- [ ] Backups enabled for database

---

## 🚀 Quick Deploy Commands

```bash
# 1. Link your project
railway link

# 2. Add MySQL
railway add --database mysql

# 3. Set environment variables
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://your-frontend.railway.app

# 4. Deploy
git push origin main

# 5. Initialize database
railway run npm run db:init
railway run npm run db:add-culture-quest
railway run npm run db:add-levio

# 6. View logs
railway logs
```

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Deployment Best Practices](https://docs.railway.app/deploy/deployments)

---

## 🎉 Success!

Your LearnHub platform is now live on Railway!

**Share your links:**
- Frontend: `https://your-frontend.railway.app`
- Backend API: `https://your-backend.railway.app`
- Health Check: `https://your-backend.railway.app/health`

**Next Steps:**
1. Test all features thoroughly
2. Add custom domain (optional)
3. Set up monitoring and alerts
4. Configure regular database backups
5. Share with users and gather feedback!

---

## 💡 Pro Tips

1. **Use Railway CLI** for faster debugging and database access
2. **Monitor costs** in Railway dashboard to avoid surprises
3. **Set up staging environment** by creating another Railway project
4. **Use environment-specific configs** for dev/staging/production
5. **Regular backups** - Export database regularly
6. **Performance monitoring** - Add APM tools like New Relic or Datadog (optional)
7. **Error tracking** - Integrate Sentry for error monitoring (optional)

Happy deploying! 🚀
