# LearnHub Test Credentials

## Demo Account

Use these credentials to test the application:

- **Email:** `test@learnhub.com`
- **Username:** `testuser`
- **Password:** `test123`

## Quick Login

On the login page, click **"Use Demo Account"** to auto-fill these credentials.

## Setting Up Test User

### Option 1: Via UI (Recommended)

1. Wait for CORS_ORIGIN to be configured in Railway backend
2. Go to the registration page
3. Register with the demo credentials above

### Option 2: Via Railway Database (Direct SQL)

1. Open Railway dashboard
2. Go to MySQL service
3. Click **Query** or **Data** tab
4. Run the SQL script from: `backend/src/scripts/testUserCredentials.sql`

### Option 3: Via Railway CLI

```bash
cd backend
railway run npm run db:create-test-user
```

## Important Notes

- The password `test123` is bcrypt-hashed in the database
- The test user starts at level 1 with 100 coins
- A character is automatically created with the user
- Use this account for testing all features without affecting real data

## After Setup

Once the test user is created, you can:
- Login via the web UI
- Test all gamification features
- Use the demo account button for quick access
- Create additional test accounts as needed
