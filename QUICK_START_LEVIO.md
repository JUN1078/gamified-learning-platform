# 🚀 Quick Start - Levio Features

This guide will help you set up and run all the new Levio features in just a few steps.

## ✅ Prerequisites

- XAMPP installed and running (MySQL + Apache)
- Node.js installed
- Project dependencies installed

## 📦 Setup Steps

### 1. Database Setup

```bash
# Navigate to backend folder
cd backend

# Run the Levio features database script
npm run db:add-levio
```

This will create:
- ✅ 13 new tables
- ✅ Sample lessons (Read, Exercise, Exam)
- ✅ Sample missions (Daily, Weekly, Social)
- ✅ Sample rewards
- ✅ Adds `coins` column to users table

### 2. Start the Backend

```bash
# In the backend folder
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Start the Frontend

```bash
# In the frontend folder
cd ../frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎯 What's New?

### 1. **Lesson System** 📚
- **Read Lessons**: Card-based learning with cover, content, collapsible sections
- **Exercise Lessons**: Interactive questions (multiple choice, checkbox, scrabble, drag & drop, essay)
- **Exam Lessons**: Timed assessments with multiple question formats
- **Progress Tracking**: Track completion, scores, and time spent
- **Rewards**: Earn XP and coins for completing lessons

**Try it:**
- Navigate to `/lessons` (you'll need to add this route)
- Complete the "Introduction to Agility" Read lesson
- Try the "Agility Challenge" Exercise lesson
- Take the "Agility Mastery Exam"

### 2. **Mission System** 🎯
- **Daily Missions**: Complete daily learning goals
- **Weekly Missions**: Longer-term objectives
- **Special Missions**: Limited-time challenges
- **Achievement Missions**: Unlock special accomplishments
- **Auto-tracking**: Missions update automatically as you complete lessons and activities

**Try it:**
- Navigate to `/missions` (add this route)
- View "Daily Learner" mission (Complete 1 lesson today)
- Complete a lesson to see progress update
- Claim rewards when mission completes

### 3. **Social Learning** 💬
- **Community Feed**: Share achievements, ask questions, start discussions, post tips
- **Interactions**: Like posts, add comments
- **Q&A**: Mark helpful comments as answers
- **User Profiles**: Display levels and titles from character system

**Try it:**
- Navigate to `/social` or `/community`
- Create a new post (Achievement, Question, Discussion, or Tip)
- Like and comment on posts
- Watch your "Social Butterfly" mission progress

### 4. **Reward Shop** 🎁
- **Coin System**: Earn coins from lessons and missions
- **Redeem Rewards**: Gift cards, cosmetics, subscriptions, merchandise
- **Redemption Codes**: Unique codes for each reward
- **Status Tracking**: Track pending, approved, delivered rewards

**Try it:**
- Navigate to `/rewards` or `/shop`
- View available rewards
- Redeem a reward with your earned coins
- Check "My Rewards" tab for redemption codes

### 5. **Notifications** 🔔
- **Real-time Alerts**: Get notified for lesson completions, mission completions, rewards
- **Unread Count**: See number of unread notifications
- **Mark as Read**: Individual or bulk mark as read
- **Auto-refresh**: Updates every 30 seconds

**Try it:**
- Look for the notification bell icon (add to your navigation)
- Complete a lesson to get a notification
- Click to view and mark as read

## 🎨 Component Examples

### Using Read Lesson Viewer

```tsx
import ReadLessonViewer from './components/lessons/ReadLessonViewer';

<ReadLessonViewer
  cards={lesson.cards}
  currentCardIndex={cardIndex}
  onCardChange={setCardIndex}
  onComplete={handleLessonComplete}
/>
```

### Using Mission Dashboard

```tsx
import MissionDashboard from './components/missions/MissionDashboard';

<Route path="/missions" element={<MissionDashboard />} />
```

### Using Social Feed

```tsx
import SocialFeed from './components/social/SocialFeed';

<Route path="/community" element={<SocialFeed />} />
```

### Using Reward Shop

```tsx
import RewardShop from './components/rewards/RewardShop';

<Route path="/shop" element={<RewardShop />} />
```

### Using Notification Bell

```tsx
import NotificationBell from './components/notifications/NotificationBell';

// In your navigation bar
<NotificationBell />
```

## 🔗 API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`)

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/start` - Start a lesson
- `POST /api/lessons/progress` - Update progress
- `POST /api/lessons/submit` - Submit answers

### Missions
- `GET /api/missions` - Get user missions
- `POST /api/missions/claim` - Claim mission reward

### Social
- `GET /api/social/feed` - Get community feed
- `POST /api/social/posts` - Create a post
- `GET /api/social/posts/:postId/comments` - Get comments
- `POST /api/social/comments` - Add a comment
- `POST /api/social/like` - Like/unlike

### Rewards
- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/my-rewards` - Get user's rewards
- `POST /api/rewards/redeem` - Redeem a reward

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## 📝 Sample Data

The setup script includes:

**Lessons:**
1. "Introduction to Agility" (Read) - 5 min, 15 XP, 10 coins
2. "Agility Challenge" (Exercise) - 3 min, 20 XP, 15 coins
3. "Agility Mastery Exam" (Exam) - 10 min, 50 XP, 30 coins

**Missions:**
1. "Daily Learner" - Complete 1 lesson (30 XP, 10 coins)
2. "Weekly Warrior" - Complete 5 lessons (100 XP, 50 coins)
3. "Social Butterfly" - Post 3 times (20 XP, 5 coins)

**Rewards:**
1. $10 Amazon Gift Card - 500 coins
2. Premium Avatar Frame - 100 coins
3. 1 Month Premium - 300 coins
4. LearnHub T-Shirt - 800 coins

## 🔄 Integration with Existing Features

### Character System
- Lesson completion awards XP
- XP increases character level
- Level updates character title
- Automatic leveling integrated

### Badge System
- Missions can award badges
- Badge display in character profile

### Expedition Map
- Lessons tied to mountains
- Mountain progress via lessons
- Unlock progression

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running in XAMPP
# Check .env file has correct database credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=learnhub_gamification
```

### Tables not created
```bash
# Ensure you ran the initialization script first
npm run db:init

# Then run the Levio script
npm run db:add-levio
```

### API errors
```bash
# Check console for specific error messages
# Verify authentication token is valid
# Check database connections
```

### Components not showing
```bash
# Ensure routes are added in App.tsx
# Check imports are correct
# Verify API services are imported
```

## 📚 Full Documentation

For detailed documentation, see:
- [LEVIO_FEATURES_GUIDE.md](./LEVIO_FEATURES_GUIDE.md) - Complete feature documentation
- [CULTURE_QUEST_GUIDE.md](./CULTURE_QUEST_GUIDE.md) - Culture Quest documentation
- [MYSQL_SETUP.md](./MYSQL_SETUP.md) - Database setup guide

## 🎉 You're Ready!

Your LearnHub platform now has:
- ✅ Comprehensive lesson system
- ✅ Mission and achievement tracking
- ✅ Social learning community
- ✅ Reward redemption shop
- ✅ Real-time notifications
- ✅ Full integration with existing features

Start exploring and have fun learning! 🚀
