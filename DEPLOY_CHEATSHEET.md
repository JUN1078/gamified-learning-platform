# 🚂 Railway Deployment Cheat Sheet

Quick reference for deploying LearnHub to Railway.

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Add MySQL database
railway add --database mysql

# 5. Deploy backend
cd backend
railway up

# 6. Set environment variables
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
railway variables set NODE_ENV=production

# 7. Initialize database
railway run npm run db:init
railway run npm run db:add-culture-quest
railway run npm run db:add-levio

# 8. Get backend URL
railway domain

# 9. Deploy frontend
cd ../frontend
railway up

# 10. Set frontend env variables
railway variables set VITE_API_URL=https://your-backend-url.railway.app

# Done! 🎉
```

## 📋 Essential Commands

### Project Management
```bash
railway login                    # Login to Railway
railway init                     # Initialize new project
railway link                     # Link to existing project
railway status                   # Check project status
railway open                     # Open project in browser
```

### Environment Variables
```bash
railway variables                # List all variables
railway variables set KEY=value  # Set variable
railway variables delete KEY     # Delete variable
```

### Deployment
```bash
railway up                       # Deploy current directory
railway up --detach             # Deploy in background
railway deploy                   # Alias for 'up'
```

### Database
```bash
railway add --database mysql     # Add MySQL
railway connect MySQL            # Connect to MySQL shell
railway run [command]           # Run command with Railway env
```

### Monitoring
```bash
railway logs                     # View logs (follow)
railway logs --tail 100         # Last 100 lines
railway ps                      # List services
```

### Domains
```bash
railway domain                   # Generate domain
railway domain add example.com  # Add custom domain
```

## 🔑 Required Environment Variables

### Backend (.env)
```bash
# Database (Railway auto-provides these)
DATABASE_URL=${{MySQL.DATABASE_URL}}
# or
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}

# Application
PORT=5000
NODE_ENV=production
JWT_SECRET=your-random-64-char-string
CORS_ORIGIN=https://your-frontend.railway.app
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.railway.app
NODE_ENV=production
```

## 📦 package.json Requirements

### Backend
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Frontend
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0 --port $PORT",
    "serve": "serve -s dist -l $PORT"
  },
  "devDependencies": {
    "serve": "^14.2.0"
  }
}
```

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────┐
│   Railway Project                    │
│                                      │
│  ┌────────────────┐                 │
│  │  MySQL DB      │                 │
│  │  Port: 3306    │                 │
│  └────────┬───────┘                 │
│           │                          │
│  ┌────────▼───────┐                 │
│  │  Backend API   │                 │
│  │  Port: 5000    │                 │
│  │  /api/*        │                 │
│  └────────┬───────┘                 │
│           │                          │
│  ┌────────▼───────┐                 │
│  │  Frontend      │                 │
│  │  React + Vite  │                 │
│  │  Port: 3000    │                 │
│  └────────────────┘                 │
│                                      │
└─────────────────────────────────────┘
```

## 🗂️ Project Structure for Railway

```
gamification/
├── backend/
│   ├── src/
│   ├── package.json      ← "start": "node dist/server.js"
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json      ← "build": "vite build"
│   ├── vite.config.ts
│   └── .env.example
└── railway.json          ← Optional: Railway config
```

## ⚙️ Railway Dashboard Setup

### 1. Create Services

**MySQL Database:**
- Type: MySQL
- Plan: Developer ($5/month)

**Backend Service:**
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: 5000 (Railway auto-assigns public port)

**Frontend Service:**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run serve`
- Port: 3000 (Railway auto-assigns public port)

### 2. Connect Services

Backend connects to MySQL using environment variables:
```bash
DATABASE_URL=${{MySQL.DATABASE_URL}}
```

Frontend connects to Backend:
```bash
VITE_API_URL=https://backend-production-xxxx.railway.app
```

## 🔄 Deployment Workflow

### Initial Deployment
```bash
# 1. Push to GitHub
git push origin main

# 2. Railway auto-deploys
# (or use railway up)

# 3. Initialize database
railway run npm run db:init
railway run npm run db:add-culture-quest
railway run npm run db:add-levio

# 4. Verify
curl https://your-backend.railway.app/health
```

### Updates
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Railway auto-deploys
# No need to re-run database scripts
```

## 🐛 Quick Troubleshooting

### Build Failed
```bash
# Check logs
railway logs --tail 100

# Common fixes:
npm install          # Install deps locally first
npm run build        # Test build locally
rm -rf node_modules  # Clean install
```

### Database Connection Error
```bash
# Verify variables
railway variables | grep DB

# Test connection
railway run node -e "console.log(process.env.DATABASE_URL)"

# Reconnect
railway link
```

### CORS Error
```bash
# Update backend CORS_ORIGIN
railway variables set CORS_ORIGIN=https://your-frontend.railway.app

# Redeploy
railway up --detach
```

### Frontend Can't Reach Backend
```bash
# Check frontend env
railway variables | grep VITE

# Set correct URL
railway variables set VITE_API_URL=https://backend-url.railway.app

# Rebuild
railway up --detach
```

## 💰 Cost Estimate

| Resource | Cost | Notes |
|----------|------|-------|
| MySQL Database | $5-10/month | Based on usage |
| Backend Service | $5-10/month | Based on usage |
| Frontend Service | $3-5/month | Static hosting |
| **Total** | **$13-25/month** | Approximate |

## 🎯 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `package.json` scripts correct
- [ ] `.gitignore` includes `.env`
- [ ] Railway project created
- [ ] MySQL database added
- [ ] Environment variables set
- [ ] CORS_ORIGIN matches frontend URL
- [ ] JWT_SECRET is secure
- [ ] Database initialized
- [ ] Health check endpoint works
- [ ] All features tested

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

## 🎉 One-Liner Deploy

For a completely fresh deployment:

```bash
railway login && railway init && railway add --database mysql && cd backend && railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))") NODE_ENV=production && railway up && railway run npm run db:init && railway run npm run db:add-culture-quest && railway run npm run db:add-levio && cd ../frontend && railway variables set VITE_API_URL=$(railway domain) && railway up
```

(Not recommended - use step-by-step for better control!)

---

**See [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md) for detailed instructions.**
