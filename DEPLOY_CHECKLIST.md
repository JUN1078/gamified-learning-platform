# ✅ Railway Deployment Checklist

Follow this checklist step-by-step to deploy LearnHub to Railway via GitHub.

---

## 📝 Pre-Deployment (Do This First)

### ☐ 1. Code Preparation

- [ ] Ensure `backend/package.json` has:
  ```json
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
  ```

- [ ] Ensure `frontend/package.json` has:
  ```json
  "scripts": {
    "build": "tsc && vite build",
    "serve": "serve -s dist -l $PORT"
  },
  "engines": {
    "node": ">=18.0.0"
  }
  ```

- [ ] Install `serve` in frontend:
  ```bash
  cd frontend
  npm install --save-dev serve
  ```

- [ ] Verify `.gitignore` includes:
  ```
  .env
  .env.local
  .env.production
  node_modules/
  dist/
  ```

### ☐ 2. GitHub Setup

- [ ] Create GitHub repository (if not exists)
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Prepare for Railway deployment"
  ```
- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```

---

## 🚂 Railway Setup

### ☐ 3. Railway Account

- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Login with GitHub account
- [ ] Authorize Railway to access your repositories

### ☐ 4. Create Project

- [ ] Click "**+ New Project**"
- [ ] Note: You'll add services next

---

## 💾 Database Setup

### ☐ 5. Add MySQL Database

- [ ] Click "**+ New**"
- [ ] Select "**Database**"
- [ ] Choose "**MySQL**"
- [ ] Wait for provisioning (~30 seconds)
- [ ] ✅ Database ready!

---

## 🔧 Backend Deployment

### ☐ 6. Add Backend Service

- [ ] Click "**+ New**"
- [ ] Select "**GitHub Repo**"
- [ ] Choose your repository
- [ ] Service created!

### ☐ 7. Configure Backend

- [ ] Click on backend service
- [ ] Go to **Settings**
- [ ] Set **Service Name**: `backend`
- [ ] Set **Root Directory**: `backend`
- [ ] Verify **Build Command**: `npm install && npm run build`
- [ ] Verify **Start Command**: `npm start`

### ☐ 8. Add Backend Environment Variables

Click "**Variables**" tab and add:

- [ ] `DATABASE_URL` = `${{MySQL.DATABASE_URL}}`
- [ ] `PORT` = `5000`
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = Generate using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] `CORS_ORIGIN` = `http://localhost:3000` (update later)

### ☐ 9. Generate Backend Domain

- [ ] Go to **Settings** → **Networking**
- [ ] Click "**Generate Domain**"
- [ ] **Copy the URL**: `https://backend-production-xxxx.up.railway.app`
- [ ] 📝 Save this URL for frontend configuration!

### ☐ 10. Deploy Backend

- [ ] Wait for auto-deployment or click "**Deploy**"
- [ ] Watch logs in "**Deployments**" tab
- [ ] Wait for ✅ **Success** status
- [ ] Test: Visit `https://backend-url/health`

---

## 📊 Database Initialization

### ☐ 11. Initialize Database (Choose ONE Method)

**Method A: Railway CLI** (Recommended)

- [ ] Install Railway CLI:
  ```bash
  npm install -g @railway/cli
  ```
- [ ] Login:
  ```bash
  railway login
  ```
- [ ] Link project:
  ```bash
  railway link
  ```
- [ ] Run initialization scripts:
  ```bash
  railway run npm run db:init
  railway run npm run db:add-culture-quest
  railway run npm run db:add-levio
  ```
- [ ] ✅ Database initialized!

**OR Method B: Auto-Initialize** (Alternative)

- [ ] Add environment variable:
  - `AUTO_INIT_DB` = `true`
- [ ] Add auto-init code to `server.ts` (see full guide)
- [ ] Redeploy backend
- [ ] Check logs to verify initialization
- [ ] Change `AUTO_INIT_DB` to `false`
- [ ] Redeploy again

---

## 🎨 Frontend Deployment

### ☐ 12. Add Frontend Service

- [ ] Click "**+ New**"
- [ ] Select "**GitHub Repo**"
- [ ] Choose your repository (same repo)
- [ ] Service created!

### ☐ 13. Configure Frontend

- [ ] Click on frontend service
- [ ] Go to **Settings**
- [ ] Set **Service Name**: `frontend`
- [ ] Set **Root Directory**: `frontend`
- [ ] Verify **Build Command**: `npm install && npm run build`
- [ ] Verify **Start Command**: `npm run serve`

### ☐ 14. Add Frontend Environment Variables

Click "**Variables**" tab and add:

- [ ] `VITE_API_URL` = (backend URL from step 9)
  ```
  https://backend-production-xxxx.up.railway.app
  ```
- [ ] `NODE_ENV` = `production`

### ☐ 15. Generate Frontend Domain

- [ ] Go to **Settings** → **Networking**
- [ ] Click "**Generate Domain**"
- [ ] **Copy the URL**: `https://frontend-production-yyyy.up.railway.app`
- [ ] 📝 This is your app URL!

### ☐ 16. Deploy Frontend

- [ ] Wait for auto-deployment or click "**Deploy**"
- [ ] Watch logs in "**Deployments**" tab
- [ ] Wait for ✅ **Success** status

---

## 🔄 Update CORS

### ☐ 17. Fix CORS Settings

- [ ] Go back to **Backend service**
- [ ] Click "**Variables**"
- [ ] Find `CORS_ORIGIN`
- [ ] Update to frontend URL:
  ```
  https://frontend-production-yyyy.up.railway.app
  ```
- [ ] Click "**Redeploy**" button

---

## ✅ Testing

### ☐ 18. Test Backend

- [ ] Visit: `https://backend-url/health`
- [ ] Should return:
  ```json
  {"status":"ok","timestamp":"..."}
  ```

### ☐ 19. Test Frontend

- [ ] Visit: `https://frontend-url`
- [ ] Should see login page
- [ ] No CORS errors in browser console (F12)

### ☐ 20. Test Complete Flow

- [ ] Register new account
- [ ] Login successfully
- [ ] Create character
- [ ] View expedition map
- [ ] Complete a lesson
- [ ] Check missions
- [ ] View social feed
- [ ] Browse rewards
- [ ] Check notifications

---

## 🎯 Post-Deployment

### ☐ 21. Verify Auto-Deploy

- [ ] Make a small change locally
- [ ] Commit and push to GitHub:
  ```bash
  git add .
  git commit -m "Test auto-deploy"
  git push origin main
  ```
- [ ] Watch Railway automatically rebuild and deploy
- [ ] ✅ Auto-deploy working!

### ☐ 22. Security Check

- [ ] JWT_SECRET is strong (64+ characters)
- [ ] CORS_ORIGIN points to correct frontend URL
- [ ] .env files not committed to GitHub
- [ ] Database credentials using Railway variables
- [ ] HTTPS working automatically

### ☐ 23. Save Important URLs

```
📱 Frontend (Your App):
https://frontend-production-yyyy.up.railway.app

🔧 Backend API:
https://backend-production-xxxx.up.railway.app

💾 Railway Dashboard:
https://railway.app/project/your-project-id
```

---

## 🎉 Deployment Complete!

Congratulations! Your app is now live! 🚀

### Share Your App:
- Frontend URL: `___________________________________`
- Create test account and explore!

### What's Next?

- [ ] Share with friends/testers
- [ ] Gather feedback
- [ ] Add custom domain (optional)
- [ ] Monitor usage in Railway dashboard
- [ ] Make improvements and push to GitHub (auto-deploys!)

---

## 📊 Quick Status Check

| Component | Status | URL |
|-----------|--------|-----|
| MySQL Database | ⚪ ✅ | Internal |
| Backend API | ⚪ ✅ | `https://backend-...` |
| Frontend App | ⚪ ✅ | `https://frontend-...` |
| Database Init | ⚪ ✅ | N/A |
| Auto-Deploy | ⚪ ✅ | GitHub integrated |

Check each box as you verify! ✅

---

## 🆘 Need Help?

### Common Issues:

**Build Failed?**
- Check Railway deployment logs
- Test build locally: `npm run build`
- Check package.json scripts

**CORS Error?**
- Update backend `CORS_ORIGIN` variable
- Redeploy backend
- Clear browser cache

**Can't Connect to Database?**
- Verify `DATABASE_URL` variable
- Check MySQL service is running
- Review backend logs

**Frontend Blank Page?**
- Open browser console (F12)
- Check `VITE_API_URL` variable
- Test backend health endpoint

### Resources:

- 📚 Full Guide: [DEPLOY_GITHUB_TO_RAILWAY.md](./DEPLOY_GITHUB_TO_RAILWAY.md)
- 💡 Quick Commands: [DEPLOY_CHEATSHEET.md](./DEPLOY_CHEATSHEET.md)
- 📖 Railway Docs: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway

---

## 💰 Estimated Cost

| Service | Monthly Cost |
|---------|--------------|
| MySQL Database | $5-10 |
| Backend Service | $5-10 |
| Frontend Service | $3-5 |
| **Total** | **$13-25** |

💡 Railway offers $5 trial credit to get started!

---

**Last Updated:** January 2026
**Platform:** Railway
**Method:** GitHub Integration

---

Print this checklist and check off each item as you complete it! ✅
