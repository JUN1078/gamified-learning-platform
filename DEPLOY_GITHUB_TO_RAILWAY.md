# 🚂 Deploy to Railway via GitHub - Step by Step

Complete guide to deploy LearnHub from GitHub to Railway.

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Railway account (sign up at [railway.app](https://railway.app))
- ✅ Your code pushed to a GitHub repository

---

## 🎯 Step 1: Prepare Your Code for Deployment

### 1.1 Update Backend package.json

Make sure `backend/package.json` has these scripts:

```json
{
  "name": "learnhub-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.2 Update Frontend package.json

Install `serve` for production hosting:

```bash
cd frontend
npm install --save-dev serve
```

Update `frontend/package.json`:

```json
{
  "name": "learnhub-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "serve": "serve -s dist -l $PORT"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.3 Create .gitignore

Ensure you have `.gitignore` in root:

```gitignore
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production
backend/.env
frontend/.env

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### 1.4 Commit and Push to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "Prepare for Railway deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 2: Create Railway Project

### 2.1 Sign Up / Login to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with your **GitHub account**
4. Authorize Railway to access your GitHub repositories

### 2.2 Create New Project

1. Click **"+ New Project"**
2. You'll see options:
   - Deploy from GitHub repo
   - Provision MySQL
   - Empty Project
   - Templates

---

## 💾 Step 3: Add MySQL Database

### 3.1 Add Database First

1. Click **"+ New"**
2. Select **"Database"**
3. Choose **"MySQL"**
4. Railway will provision a MySQL database
5. ✅ Database created! (takes ~30 seconds)

### 3.2 Note Database Details

Click on the MySQL service to see:
- **Host**: `containers-us-west-xxx.railway.app`
- **Port**: `6379` (example)
- **Username**: `root`
- **Password**: (auto-generated)
- **Database**: `railway`

**Or use the convenient variables:**
- `${{MySQL.DATABASE_URL}}`
- `${{MySQL.MYSQL_HOST}}`
- `${{MySQL.MYSQL_PORT}}`
- `${{MySQL.MYSQL_USER}}`
- `${{MySQL.MYSQL_PASSWORD}}`
- `${{MySQL.MYSQL_DATABASE}}`

---

## 🔧 Step 4: Deploy Backend

### 4.1 Add Backend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your repository (e.g., `gamification`)
4. Railway will create a service

### 4.2 Configure Backend Service

Click on the new service, then:

#### A. Settings → Service Name
- Change name to `backend` (optional but recommended)

#### B. Settings → Root Directory
- Set to: `backend`
- This tells Railway to only build the backend folder

#### C. Settings → Build & Start Commands
Railway usually auto-detects, but verify:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### D. Settings → Environment Variables

Click **"Variables"** tab, then **"+ New Variable"**:

```bash
# Database Connection (use Railway's reference variables)
DATABASE_URL = ${{MySQL.DATABASE_URL}}

# OR configure individually:
DB_HOST = ${{MySQL.MYSQL_HOST}}
DB_PORT = ${{MySQL.MYSQL_PORT}}
DB_USER = ${{MySQL.MYSQL_USER}}
DB_PASSWORD = ${{MySQL.MYSQL_PASSWORD}}
DB_NAME = ${{MySQL.MYSQL_DATABASE}}

# Server Configuration
PORT = 5000
NODE_ENV = production

# JWT Secret (generate a secure random string)
JWT_SECRET = your-super-secret-jwt-key-change-this-now

# CORS (update after deploying frontend)
CORS_ORIGIN = http://localhost:3000
```

**Generate JWT Secret:**
```bash
# Run this command locally to generate:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### E. Settings → Networking

1. Click **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL: `https://backend-production-xxxx.up.railway.app`
4. ✅ Save this URL - you'll need it for the frontend!

### 4.3 Deploy Backend

1. Click **"Deploy"** or wait for auto-deployment
2. Watch the logs in the **"Deployments"** tab
3. Wait for "✅ Success" status

---

## 📊 Step 5: Initialize Database

You have 3 options to initialize your database:

### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Select your backend service
# Then run initialization scripts:

railway run npm run db:init
railway run npm run db:add-culture-quest
railway run npm run db:add-levio
```

### Option B: Temporary Admin Endpoint

Add this to `backend/src/server.ts`:

```typescript
// TEMPORARY: Remove after initialization!
app.post('/api/admin/initialize-db', async (req, res) => {
  const { secret } = req.body;

  // Use a secret key for security
  if (secret !== process.env.INIT_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Initializing database...');

    // Run initialization scripts
    const { default: initDB } = await import('./scripts/initDatabase.js');
    await initDB();

    const { default: addCulture } = await import('./scripts/addCultureQuest.js');
    await addCulture();

    const { default: addLevio } = await import('./scripts/addLevioFeatures.js');
    await addLevio();

    res.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

Add environment variable in Railway:
```bash
INIT_SECRET = your-temporary-secret-12345
```

Then call it once:
```bash
curl -X POST https://your-backend.railway.app/api/admin/initialize-db \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-temporary-secret-12345"}'
```

**⚠️ IMPORTANT: Remove this endpoint after initialization!**

### Option C: Auto-Initialize on First Start

Modify `backend/src/server.ts`:

```typescript
const startServer = async () => {
  await connectDB();

  // One-time initialization
  if (process.env.AUTO_INIT_DB === 'true') {
    console.log('🔧 Running one-time database initialization...');
    try {
      await import('./scripts/initDatabase.js');
      await import('./scripts/addCultureQuest.js');
      await import('./scripts/addLevioFeatures.js');
      console.log('✅ Database initialized');

      // Prevent re-running on restart
      console.log('⚠️  Set AUTO_INIT_DB=false to prevent re-initialization');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};
```

Set in Railway variables:
```bash
AUTO_INIT_DB = true
```

After first successful deployment, change to:
```bash
AUTO_INIT_DB = false
```

---

## 🎨 Step 6: Deploy Frontend

### 6.1 Add Frontend Service

1. In Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose the **same repository**
4. Railway creates another service

### 6.2 Configure Frontend Service

Click on the frontend service:

#### A. Settings → Service Name
- Change to `frontend`

#### B. Settings → Root Directory
- Set to: `frontend`

#### C. Settings → Build & Start Commands
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run serve`

#### D. Settings → Environment Variables

Add these variables:

```bash
# Backend API URL (use the backend URL from Step 4.2.E)
VITE_API_URL = https://backend-production-xxxx.up.railway.app

# Node Environment
NODE_ENV = production
```

#### E. Settings → Networking

1. Click **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL: `https://frontend-production-yyyy.up.railway.app`
4. ✅ This is your app URL!

### 6.3 Deploy Frontend

1. Click **"Deploy"** or wait for auto-deployment
2. Watch deployment logs
3. Wait for "✅ Success"

---

## 🔄 Step 7: Update CORS Settings

### 7.1 Update Backend CORS

1. Go to **Backend service**
2. Click **"Variables"**
3. Find `CORS_ORIGIN`
4. Update to your frontend URL:
   ```bash
   CORS_ORIGIN = https://frontend-production-yyyy.up.railway.app
   ```
5. Click **"Redeploy"** to apply changes

---

## ✅ Step 8: Test Your Deployment

### 8.1 Test Backend Health

Visit: `https://backend-production-xxxx.up.railway.app/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-29T12:00:00.000Z"
}
```

### 8.2 Test Frontend

Visit: `https://frontend-production-yyyy.up.railway.app`

Should see your app login page!

### 8.3 Test Complete Flow

1. **Register** a new account
2. **Create character** with 12 attributes
3. **View expedition map** with 5 mountains
4. **Complete a lesson** from the sample data
5. **Check missions** - should see progress
6. **View social feed** - try creating a post
7. **Browse rewards** - check the shop
8. **Check notifications** - should have notification from lesson

---

## 🎯 Step 9: Configure Auto-Deployment

Good news! Railway automatically deploys when you push to GitHub.

### 9.1 Enable Auto-Deploy (Default)

Auto-deploy is enabled by default. To verify:
1. Go to service **"Settings"**
2. Scroll to **"Deploy Settings"**
3. Ensure **"Auto Deploy"** is ON

### 9.2 Deploy Triggers

Railway will auto-deploy when:
- You push to the main branch
- You merge a pull request
- You commit directly to GitHub

### 9.3 Test Auto-Deploy

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main

# Watch Railway automatically:
# 1. Detect the push
# 2. Build your code
# 3. Deploy if successful
# 4. Update the live site
```

---

## 📊 Project Structure in Railway

Your Railway project should look like:

```
📦 LearnHub Project
├── 💾 MySQL Database
│   ├── Host: containers-us-west-xxx.railway.app
│   └── Port: 6379
│
├── 🔧 Backend Service
│   ├── Source: GitHub → gamification/backend
│   ├── Domain: backend-production-xxxx.railway.app
│   └── Variables: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
│
└── 🎨 Frontend Service
    ├── Source: GitHub → gamification/frontend
    ├── Domain: frontend-production-yyyy.railway.app
    └── Variables: VITE_API_URL
```

---

## 🔒 Security Checklist

Before sharing your app:

- [ ] JWT_SECRET is a strong random string (64+ characters)
- [ ] CORS_ORIGIN is set to your frontend URL only
- [ ] .env files are in .gitignore (not committed to GitHub)
- [ ] Database credentials are using Railway's ${{MySQL.*}} variables
- [ ] Auto-initialization endpoint removed (if you used Option B)
- [ ] Test that unauthorized API calls are rejected
- [ ] SSL/HTTPS is working (Railway provides this automatically)

---

## 💰 Cost Breakdown

| Service | Cost | Details |
|---------|------|---------|
| MySQL Database | $5-10/month | Based on storage & compute |
| Backend (Node.js) | $5-10/month | Based on usage |
| Frontend (Static) | $3-5/month | Based on bandwidth |
| **Total** | **$13-25/month** | Estimated monthly cost |

**Free Tier:** Railway offers $5 trial credit (credit card required)

---

## 🐛 Troubleshooting

### Build Failed on Railway

**Check Build Logs:**
1. Click on service
2. Go to **"Deployments"** tab
3. Click on failed deployment
4. Read error messages

**Common Issues:**
- Missing dependencies: Add to package.json
- TypeScript errors: Fix locally first with `npm run build`
- Wrong Node version: Set in package.json engines

### Database Connection Failed

**Error:** `ECONNREFUSED` or `Access denied`

**Fix:**
1. Verify `DATABASE_URL` variable is set
2. Check it references MySQL service: `${{MySQL.DATABASE_URL}}`
3. Ensure MySQL service is running

### CORS Error in Browser

**Error:** `Access-Control-Allow-Origin`

**Fix:**
1. Go to Backend → Variables
2. Update `CORS_ORIGIN` to exact frontend URL
3. Redeploy backend
4. Clear browser cache

### Frontend Shows Blank Page

**Check:**
1. Open browser console (F12)
2. Look for errors
3. Verify `VITE_API_URL` is set correctly
4. Test backend directly: `https://backend-url/health`

### Tables Not Found

**Error:** `Table 'lessons' doesn't exist`

**Fix:**
Run initialization scripts:
```bash
railway link
railway run npm run db:init
railway run npm run db:add-culture-quest
railway run npm run db:add-levio
```

---

## 🔄 Update Workflow

### Making Changes

```bash
# 1. Make changes locally
# Edit your code

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Add new feature"

# 4. Push to GitHub
git push origin main

# 5. Railway automatically deploys!
# Watch deployment in Railway dashboard
```

### Rollback if Needed

1. Go to service in Railway
2. Click **"Deployments"**
3. Find previous successful deployment
4. Click **"..."** → **"Redeploy"**

---

## 🌟 Custom Domain (Optional)

### Add Your Own Domain

1. Go to Frontend service
2. **Settings** → **"Domains"**
3. Click **"+ Custom Domain"**
4. Enter: `app.yourdomain.com`

### Configure DNS

Add to your domain's DNS:
```
Type: CNAME
Name: app
Value: frontend-production-yyyy.up.railway.app
TTL: 3600
```

### SSL Certificate

Railway automatically provisions SSL certificates!
- No configuration needed
- Free Let's Encrypt certificates
- Auto-renewal

---

## 📈 Monitoring

### View Logs

```bash
# Using Railway CLI
railway logs

# Or in Dashboard:
# Click service → "Deployments" → View logs
```

### Metrics

Railway Dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response times

### Set Up Alerts

1. Go to project settings
2. **"Notifications"**
3. Add webhook or email alerts for:
   - Deployment failures
   - High resource usage
   - Service crashes

---

## 🎉 Success Checklist

Verify everything works:

- [ ] Backend health check returns OK
- [ ] Frontend loads successfully
- [ ] User registration works
- [ ] Login/authentication works
- [ ] Character creation works
- [ ] Expedition map displays
- [ ] Lessons can be completed
- [ ] Missions track progress
- [ ] Social feed loads
- [ ] Reward shop accessible
- [ ] Notifications appear
- [ ] No CORS errors
- [ ] HTTPS/SSL working
- [ ] Auto-deploy from GitHub works

---

## 📚 Quick Reference

### Your URLs

```bash
# Backend API
https://backend-production-xxxx.up.railway.app

# Frontend App
https://frontend-production-yyyy.up.railway.app

# MySQL Database
Internal Railway networking (no public URL)
```

### Important Variables

**Backend:**
```bash
DATABASE_URL=${{MySQL.DATABASE_URL}}
JWT_SECRET=<your-secret>
CORS_ORIGIN=<frontend-url>
NODE_ENV=production
```

**Frontend:**
```bash
VITE_API_URL=<backend-url>
NODE_ENV=production
```

---

## 🚀 You're Live!

Congratulations! Your LearnHub platform is now:
- ✅ Deployed to Railway
- ✅ Connected to MySQL database
- ✅ Auto-deploying from GitHub
- ✅ Running on HTTPS
- ✅ Ready for users!

**Share your app:**
- Frontend URL: `https://frontend-production-yyyy.up.railway.app`
- Create accounts and start learning!

**What's Next?**
1. Share with friends/testers
2. Gather feedback
3. Make improvements
4. Push to GitHub
5. Railway auto-deploys!

Happy deploying! 🎊
