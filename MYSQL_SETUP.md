# MySQL Setup Guide (XAMPP) 🚀

Complete guide to set up the LearnHub platform with **MySQL using XAMPP** - 100% FREE!

## ✅ What Changed

The backend has been converted from MongoDB to MySQL:
- ✅ Using **mysql2** package instead of Mongoose
- ✅ SQL tables instead of MongoDB collections
- ✅ Works perfectly with **XAMPP**
- ✅ All authentication and character features working

---

## Step 1: Install XAMPP (5 minutes)

### Download XAMPP

1. Go to: https://www.apachefriends.org/
2. Download **XAMPP for Windows**
3. Choose the latest version (PHP 8.x)
4. Download size: ~150 MB

### Install XAMPP

1. Run the installer (`xampp-windows-x64-xxx-installer.exe`)
2. If Windows asks about antivirus/firewall, click **Yes**
3. Select components:
   - ✅ **Apache** (web server)
   - ✅ **MySQL** (database) - **REQUIRED**
   - ✅ **phpMyAdmin** (database management) - **REQUIRED**
   - ❌ FileZilla, Mercury, Tomcat (optional - can uncheck)
4. Installation folder: `C:\xampp` (recommended, keep default)
5. Click **Next** through the rest
6. Uncheck "Learn more about Bitnami" if you want
7. Click **Finish**

---

## Step 2: Start MySQL (30 seconds)

### Open XAMPP Control Panel

1. Search Windows for **"XAMPP Control Panel"**
2. Or go to: `C:\xampp\xampp-control.exe`
3. **Right-click** → **Run as Administrator** (important!)

### Start MySQL

In XAMPP Control Panel:
1. Find **MySQL** row
2. Click **Start** button
3. It should turn **GREEN** and say "Running"

**Note**: You do NOT need to start Apache unless you want to use phpMyAdmin web interface.

### Troubleshoot Port Conflicts

If MySQL won't start:

**Error: Port 3306 in use**

Solution 1 - Stop conflicting service:
```bash
# Open Command Prompt as Administrator
net stop MySQL80
# Or whatever MySQL service is running
```

Solution 2 - Change MySQL port:
1. Click **Config** button next to MySQL
2. Select **my.ini**
3. Find `port=3306`
4. Change to `port=3307`
5. Save and restart MySQL

Then update your `.env`:
```env
DB_HOST=localhost:3307
```

---

## Step 3: Create Database (2 minutes)

You have TWO options:

### Option A: Automatic (Recommended) ✨

We have a script that creates everything automatically!

```bash
# Navigate to backend folder
cd e:\AI PROJECT\gamification\backend

# Run database initialization
npm run db:init
```

You'll see:
```
🔗 Connected to MySQL server
✅ Database "learnhub_gamification" created/verified
✅ Table "users" created/verified
✅ Table "characters" created/verified
✅ Table "mountains" created/verified
✅ Table "user_mountain_progress" created/verified
✅ Default mountains inserted/updated

🎉 Database initialization complete!
```

**Done!** Skip to Step 4.

### Option B: Manual (using phpMyAdmin)

1. **Open phpMyAdmin:**
   - Click **Admin** button next to MySQL in XAMPP
   - Or go to: http://localhost/phpmyadmin

2. **Create Database:**
   - Click **"New"** in left sidebar
   - Database name: `learnhub_gamification`
   - Collation: `utf8mb4_unicode_ci`
   - Click **Create**

3. **Run SQL Script:**
   - Click on `learnhub_gamification` database
   - Click **SQL** tab at the top
   - Copy and paste this SQL:

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Characters table
CREATE TABLE characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,

  -- 12 Attributes
  leadership DECIMAL(3,1) DEFAULT 5.0,
  creativity DECIMAL(3,1) DEFAULT 5.0,
  communication DECIMAL(3,1) DEFAULT 5.0,
  teamwork DECIMAL(3,1) DEFAULT 5.0,
  problem_solving DECIMAL(3,1) DEFAULT 5.0,
  innovation DECIMAL(3,1) DEFAULT 5.0,
  adaptability DECIMAL(3,1) DEFAULT 5.0,
  technical_skills DECIMAL(3,1) DEFAULT 5.0,
  critical_thinking DECIMAL(3,1) DEFAULT 5.0,
  empathy DECIMAL(3,1) DEFAULT 5.0,
  resilience DECIMAL(3,1) DEFAULT 5.0,
  strategic_thinking DECIMAL(3,1) DEFAULT 5.0,

  -- Avatar
  base_character VARCHAR(100) DEFAULT 'default',
  sash VARCHAR(100) DEFAULT NULL,
  badges JSON DEFAULT NULL,
  accessories JSON DEFAULT NULL,

  -- Progression
  title VARCHAR(100) DEFAULT 'Novice Explorer',
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  next_level_xp INT DEFAULT 100,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mountains table
CREATE TABLE mountains (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  attributes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default mountains
INSERT INTO mountains (id, name, description, color, attributes) VALUES
('aggressive', 'Aggressive', 'The Driving Force', '#FF6B6B', '["leadership","problemSolving"]'),
('respect', 'Respect', 'The Heart of the Team', '#CD7F32', '["empathy","communication"]'),
('innovative', 'Innovative', 'The Visionary', '#B8C5D6', '["innovation","creativity"]'),
('swift', 'Swift', 'The Quick Adaptor', '#2196F3', '["adaptability","criticalThinking"]'),
('empowered', 'Empowered', 'The Independent Spirit', '#4CAF50', '["resilience","strategicThinking"]');
```

4. Click **Go**

---

## Step 4: Configure Backend (1 minute)

### Create .env file

```bash
cd e:\AI PROJECT\gamification\backend
copy .env.example .env
```

### Edit .env

Open with Notepad:
```bash
notepad .env
```

Paste this configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MySQL Database (XAMPP Default)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=learnhub_gamification

# JWT Secret (change in production)
JWT_SECRET=my-super-secret-jwt-key-at-least-32-characters-long-12345
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Important Notes:**
- `DB_USER=root` - XAMPP default username
- `DB_PASSWORD=` - Empty by default (no password)
- If you set a MySQL password in XAMPP, put it here

**Save the file!**

---

## Step 5: Install MySQL Package

The backend needs the `mysql2` package:

```bash
cd e:\AI PROJECT\gamification\backend
npm install
```

This will install `mysql2` and all dependencies.

---

## Step 6: Start the Application 🎉

### Terminal 1 - Start Backend

```bash
cd e:\AI PROJECT\gamification\backend
npm run dev
```

**You should see:**
```
✅ MySQL connected successfully
📊 Database: learnhub_gamification
🚀 Server running on port 5000
📍 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

✅ **Success!** Backend is running with MySQL!

### Terminal 2 - Start Frontend

```bash
cd e:\AI PROJECT\gamification\frontend
npm run dev
```

**You should see:**
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:3000/
```

---

## Step 7: Test the Application

### Open Browser

Go to: **http://localhost:3000**

### Register Your First Account

1. Click **"Register"**
2. Fill in:
   - Email: `test@test.com`
   - Username: `testuser`
   - Password: `password123`
3. Click **"Create Account"**

If it works, you'll:
- Be logged in automatically
- See the Dashboard
- Have a character with 12 attributes created!

### View Your Data in phpMyAdmin

1. Open: http://localhost/phpmyadmin
2. Click `learnhub_gamification` database
3. Click `users` table → See your user!
4. Click `characters` table → See your character with 12 attributes!

---

## Database Structure 📊

### Tables Created

**1. users**
```
- id (INT, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- username (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**2. characters**
```
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY → users.id)
- 12 attributes (DECIMAL 3,1)
  - leadership, creativity, communication, teamwork
  - problem_solving, innovation, adaptability
  - technical_skills, critical_thinking, empathy
  - resilience, strategic_thinking
- Avatar data (JSON)
- level, xp, title
- created_at, updated_at
```

**3. mountains**
```
- id (VARCHAR, PRIMARY KEY)
- name, description, color
- attributes (JSON)
```

**4. user_mountain_progress** (for Phase 2)
```
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- mountain_id (VARCHAR, FOREIGN KEY)
- progress data
```

---

## Troubleshooting 🔧

### MySQL Won't Start

**Error**: Port 3306 already in use

**Solution**:
```bash
# Check what's using port 3306
netstat -ano | findstr :3306

# Stop the process or change MySQL port in XAMPP
```

### Backend Error: "Access denied for user 'root'"

**Solution 1**: Check if MySQL is running in XAMPP

**Solution 2**: Set MySQL password if needed:
1. Open phpMyAdmin
2. Click "User accounts"
3. Edit `root@localhost`
4. Set password
5. Update `.env` with password

### Error: "Unknown database 'learnhub_gamification'"

**Solution**: Run the database initialization:
```bash
cd backend
npm run db:init
```

### Frontend Can't Connect to Backend

**Check**:
1. Is backend running? (Terminal should show "Server running")
2. Is it on port 5000? Check `.env` PORT setting
3. CORS error? Check `CORS_ORIGIN` in `.env`

---

## XAMPP Tips 💡

### Start MySQL Automatically

In XAMPP Control Panel:
1. Click **Config** (top right, wrench icon)
2. Check ✅ **MySQL** under "Autostart of modules"
3. MySQL will start when you open XAMPP

### Access phpMyAdmin

Two ways:
1. XAMPP Control Panel → Click **Admin** next to MySQL
2. Browser: http://localhost/phpmyadmin

### Backup Your Database

1. Open phpMyAdmin
2. Click `learnhub_gamification` database
3. Click **Export** tab
4. Click **Go**
5. Downloads SQL file

### Restore Database

1. phpMyAdmin → `learnhub_gamification`
2. Click **Import** tab
3. Choose your `.sql` file
4. Click **Go**

---

## Comparison: MongoDB vs MySQL

| Feature | MongoDB (Old) | MySQL (New - XAMPP) |
|---------|---------------|---------------------|
| **Installation** | Separate download | ✅ Included in XAMPP |
| **Setup Time** | 5-10 minutes | ✅ 2-3 minutes |
| **GUI Tool** | MongoDB Compass | ✅ phpMyAdmin (better) |
| **Cost** | Free | ✅ Free |
| **Learning Curve** | Medium | ✅ Easy (SQL) |
| **Data Structure** | Documents (JSON) | Tables (Rows) |
| **Backup** | Manual | ✅ Easy (phpMyAdmin) |

---

## Next Steps

1. ✅ MySQL is running
2. ✅ Database is created
3. ✅ Backend is connected
4. ✅ Frontend is working

**You're all set!** Start building your gamified learning experience! 🎉

### Test All Features

1. **Register/Login** - Authentication working
2. **View Character** - See radar chart with 12 attributes
3. **View Expedition** - See 5 mountains (mock data)
4. **View Cards** - Card collection (mock data)
5. **View Badges** - Achievement system (mock data)

### Need Help?

- **XAMPP Issues**: https://www.apachefriends.org/faq_windows.html
- **MySQL Docs**: https://dev.mysql.com/doc/
- **phpMyAdmin**: http://localhost/phpmyadmin → Documentation

---

## Production Deployment

When ready for production:

1. **Change DB password** in XAMPP
2. **Update JWT_SECRET** to a strong random string
3. **Change NODE_ENV** to `production`
4. Use a proper MySQL server (not XAMPP)
5. Consider MySQL hosting:
   - **PlanetScale** (free tier)
   - **Railway** (MySQL plugin)
   - **AWS RDS** (paid)
   - **DigitalOcean** (paid)

---

Built with ❤️ using React, TypeScript, Node.js, and MySQL
