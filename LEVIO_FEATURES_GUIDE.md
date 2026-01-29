# Levio Features Integration Guide

This guide covers all the new features integrated from the Levio app into the LearnHub platform.

## Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Backend API](#backend-api)
4. [Frontend Components](#frontend-components)
5. [Feature Details](#feature-details)
6. [Usage Examples](#usage-examples)

---

## Overview

The Levio features integration adds comprehensive learning and gamification capabilities:

### 🎓 Lesson System
- **Read Lessons**: Card-based content with cover, content, collapsible, and transition cards
- **Exercise Lessons**: Interactive questions (multiple choice, checkbox, scrabble, drag & drop, essay)
- **Exam Lessons**: Timed assessments with multiple question formats
- Progress tracking, scoring, and XP/coin rewards

### 🎯 Mission System
- Daily, weekly, special, and achievement missions
- Multi-objective tracking
- Automatic progress updates
- XP and coin rewards upon completion

### 💬 Social Learning
- Community feed with posts (achievements, questions, discussions, tips)
- Comments and likes
- User profiles with levels and titles
- Q&A functionality with marked answers

### 🎁 Reward Shop
- Coin-based redemption system
- Multiple reward types (vouchers, physical, digital, premium features)
- Stock management
- Redemption codes and status tracking

### 🔔 Notifications
- Real-time notification system
- Unread count tracking
- Multiple notification types
- Mark as read functionality

---

## Database Setup

### Step 1: Run the Levio Features Script

```bash
cd backend
npm run db:add-levio
```

This creates 13 new tables:

#### Lesson Tables
- `lessons` - Lesson metadata and configuration
- `lesson_cards` - Cards for Read lessons
- `exercise_questions` - Questions for Exercise/Exam lessons
- `user_lesson_progress` - User progress tracking

#### Mission Tables
- `missions` - Mission definitions
- `mission_objectives` - Mission objectives/tasks
- `user_mission_progress` - User mission tracking

#### Social Tables
- `social_posts` - Community posts
- `post_comments` - Comments on posts
- `post_likes` - Like tracking

#### Reward Tables
- `rewards` - Reward catalog
- `user_rewards` - User redemptions

#### Other Tables
- `notifications` - Notification system
- Updates `users` table to add `coins` column

### Sample Data Included

The script automatically creates:
- 3 sample lessons (Read, Exercise, Exam)
- 3 sample missions (Daily, Weekly, Social)
- 4 sample rewards (Gift cards, cosmetics, etc.)

---

## Backend API

### Lesson Endpoints

#### GET `/api/lessons`
Get all lessons with optional filtering
```javascript
Query params:
- mountain_id: Filter by ARISE mountain
- type: Filter by lesson type (read/exercise/exam)
- difficulty: Filter by difficulty level
```

#### GET `/api/lessons/:id`
Get lesson details with cards/questions
```javascript
Response includes:
- Lesson metadata
- Cards (for Read lessons)
- Questions (for Exercise/Exam lessons)
- User progress
```

#### POST `/api/lessons/start`
Start a lesson
```javascript
Body: { lessonId: number }
```

#### POST `/api/lessons/progress`
Update progress for Read lessons
```javascript
Body: {
  lessonId: number,
  currentCardIndex: number,
  timeSpent: number
}
```

#### POST `/api/lessons/submit`
Submit answers for Exercise/Exam lessons
```javascript
Body: {
  lessonId: number,
  answers: { [questionId]: answer },
  timeSpent: number
}

Response: {
  score: number,
  earnedPoints: number,
  totalPoints: number,
  results: [],
  rewards: { xp, coins }
}
```

### Mission Endpoints

#### GET `/api/missions`
Get user's active missions with progress

#### POST `/api/missions/claim`
Claim completed mission rewards
```javascript
Body: { missionId: number }
```

### Social Endpoints

#### GET `/api/social/feed`
Get social feed
```javascript
Query params:
- type: Filter by post type
- limit: Number of posts (default: 20)
- offset: Pagination offset
```

#### POST `/api/social/posts`
Create a new post
```javascript
Body: {
  postType: 'achievement'|'question'|'discussion'|'tip',
  content: string,
  mediaUrl?: string,
  relatedLessonId?: number
}
```

#### GET `/api/social/posts/:postId/comments`
Get comments for a post

#### POST `/api/social/comments`
Add a comment
```javascript
Body: {
  postId: number,
  content: string,
  isAnswer?: boolean
}
```

#### POST `/api/social/like`
Like/unlike a post or comment
```javascript
Body: {
  targetType: 'post'|'comment',
  targetId: number
}
```

### Reward Endpoints

#### GET `/api/rewards`
Get all available rewards
```javascript
Query params:
- category: Filter by category
- type: Filter by type
```

#### GET `/api/rewards/my-rewards`
Get user's redeemed rewards

#### POST `/api/rewards/redeem`
Redeem a reward
```javascript
Body: { rewardId: number }

Response: {
  redemptionId: number,
  redemptionCode: string,
  reward: { name, type }
}
```

### Notification Endpoints

#### GET `/api/notifications`
Get user notifications
```javascript
Query params:
- limit: Number of notifications
- offset: Pagination offset
- unread_only: boolean
```

#### POST `/api/notifications/read`
Mark notification as read
```javascript
Body: { notificationId: number }
```

#### POST `/api/notifications/read-all`
Mark all notifications as read

---

## Frontend Components

### Lesson Components

#### `ReadLessonViewer.tsx`
Displays Read lessons with card navigation
```tsx
<ReadLessonViewer
  cards={lesson.cards}
  currentCardIndex={cardIndex}
  onCardChange={setCardIndex}
  onComplete={handleComplete}
/>
```

Features:
- Cover cards with duration
- Content cards with images
- Collapsible cards
- Transition cards with emojis
- Progress bar
- Previous/Next navigation

#### `ExerciseLessonViewer.tsx`
Interactive exercise viewer
```tsx
<ExerciseLessonViewer
  questions={lesson.questions}
  onSubmit={handleSubmit}
  onBack={handleBack}
/>
```

Features:
- Question navigation
- Answer tracking
- Hint system
- Submit functionality
- Progress indicators

#### Question Type Components

**MultipleChoiceQuestion.tsx**
- Single selection
- Visual feedback
- Radio button style

**CheckboxQuestion.tsx**
- Multiple selection
- "Select all that apply"
- Checkbox style

**ScrabbleQuestion.tsx**
- Word unscrambling
- Letter selection
- Reset functionality

**DragDropQuestion.tsx**
- Match items to targets
- Visual drag-and-drop interface
- Quick match buttons

**EssayQuestion.tsx**
- Text area input
- Word count tracking
- Minimum word requirement

#### `LessonResultScreen.tsx`
Score display and results breakdown
```tsx
<LessonResultScreen
  score={score}
  earnedPoints={earnedPoints}
  totalPoints={totalPoints}
  rewards={rewards}
  results={results}
  showExplanations={true}
/>
```

Features:
- Animated score reveal
- XP and coin rewards display
- Question breakdown
- Try again / Back to lessons buttons

### Mission Components

#### `MissionDashboard.tsx`
Complete mission management interface

Features:
- Mission type filtering (Daily, Weekly, Special, Achievement)
- Objective progress bars
- Reward display
- Claim rewards button
- Expiration tracking

### Social Components

#### `SocialFeed.tsx`
Community feed with posts and interactions

Features:
- Post type filtering
- Like/unlike posts
- Comment viewing and adding
- Post creation
- User avatars and levels

#### `CreatePostModal.tsx`
Post creation interface

Features:
- Post type selection (Discussion, Question, Tip, Achievement)
- Content editor
- Character count
- Submit functionality

### Reward Components

#### `RewardShop.tsx`
Reward browsing and redemption

Features:
- Shop/My Rewards tabs
- Category filtering
- Coin balance display
- Redemption functionality
- Redemption code display
- Status tracking

### Notification Components

#### `NotificationBell.tsx`
Notification dropdown component

Features:
- Unread count badge
- Notification list
- Mark as read
- Mark all as read
- Auto-refresh (30s interval)
- Time since display

---

## Feature Details

### Lesson System Flow

1. **User browses lessons** (`GET /api/lessons`)
   - Lessons filtered by mountain, type, difficulty
   - Shows locked/unlocked status
   - Displays user progress

2. **User starts lesson** (`POST /api/lessons/start`)
   - Creates progress record
   - Sets status to "in_progress"

3. **Read Lesson Flow**
   - User navigates through cards
   - Progress saved: `POST /api/lessons/progress`
   - On completion: Status set to "completed"

4. **Exercise/Exam Flow**
   - User answers questions
   - On submit: `POST /api/lessons/submit`
   - System calculates score
   - Awards XP and coins
   - Updates character level
   - Creates notification
   - Triggers mission progress check

5. **Mission Progress Integration**
   - Lesson completion automatically updates mission progress
   - Checks for "lesson_complete" missions
   - Updates objective counters
   - Marks missions as completed when objectives met

### Mission System Flow

1. **Missions Created**
   - Admin creates missions with objectives
   - Sets type, rewards, and recurrence

2. **User Views Missions** (`GET /api/missions`)
   - Shows active missions
   - Displays progress per objective
   - Shows overall completion percentage

3. **Progress Updates**
   - Automatic via lesson completion
   - Automatic via post creation
   - Other trigger types can be added

4. **Claim Rewards** (`POST /api/missions/claim`)
   - User claims completed mission
   - XP and coins awarded
   - Badge awarded (if applicable)
   - Mission removed from active list

### Social Learning Flow

1. **User Creates Post** (`POST /api/social/posts`)
   - Selects post type
   - Writes content
   - Mission progress updated for "post_create"

2. **Feed Display** (`GET /api/social/feed`)
   - Posts ordered by pinned then recent
   - Shows user info and levels
   - Like/comment counts

3. **Interactions**
   - Like: `POST /api/social/like`
   - Comment: `POST /api/social/comments`
   - Comments can be marked as answers (for Q&A)

### Reward System Flow

1. **Browse Rewards** (`GET /api/rewards`)
   - Filter by category/type
   - Check coin balance
   - View stock availability

2. **Redeem Reward** (`POST /api/rewards/redeem`)
   - Validates coin balance
   - Deducts coins
   - Generates redemption code
   - Creates notification
   - Updates stock

3. **View My Rewards** (`GET /api/rewards/my-rewards`)
   - See redemption codes
   - Check status (pending/approved/delivered/used)
   - View expiration dates

### Notification System

#### Notification Types
- `lesson_complete` - After finishing a lesson
- `mission_complete` - After completing a mission
- `reward_redeemed` - After redeeming a reward
- `level_up` - When character levels up
- `new_comment` - When someone comments on your post

#### Auto-Generation
Notifications are automatically created by:
- Lesson submission endpoint
- Mission claim endpoint
- Reward redemption endpoint
- (Can be extended for other events)

---

## Usage Examples

### Example 1: Complete Lesson Flow

```typescript
// 1. Load lessons
const response = await lessonService.getLessons('agility');
const lessons = response.data;

// 2. Get lesson details
const lessonDetail = await lessonService.getLessonById(lessons[0].id);

// 3. Start lesson
await lessonService.startLesson(lessons[0].id);

// 4. For Read lessons - track progress
await lessonService.updateProgress(lessons[0].id, currentCard, timeSpent);

// 5. For Exercise/Exam - submit answers
const result = await lessonService.submitAnswers(
  lessons[0].id,
  { 1: 'Answer A', 2: ['Option 1', 'Option 2'] },
  300 // time in seconds
);

console.log(`Score: ${result.data.score}%`);
console.log(`Earned: ${result.data.rewards.xp} XP, ${result.data.rewards.coins} coins`);
```

### Example 2: Mission Tracking

```typescript
// 1. Load missions
const missions = await missionService.getUserMissions();

// 2. Find completed missions
const completed = missions.data.filter(m => m.user_status === 'completed');

// 3. Claim rewards
for (const mission of completed) {
  const response = await missionService.claimMissionReward(mission.id);
  console.log(`Claimed: ${response.rewards.xp} XP, ${response.rewards.coins} coins`);
}
```

### Example 3: Social Interaction

```typescript
// 1. Create a post
await socialService.createPost(
  'question',
  'How do I improve my agility score?',
  null,
  123 // related lesson ID
);

// 2. Get feed
const feed = await socialService.getFeed('question');

// 3. Like a post
await socialService.toggleLike('post', feed.data[0].id);

// 4. Add a comment
await socialService.addComment(
  feed.data[0].id,
  'Try focusing on the expedition map lessons!',
  false // not marking as answer
);
```

### Example 4: Reward Redemption

```typescript
// 1. Check user coins (from auth context)
const userCoins = 500;

// 2. Load rewards
const rewards = await rewardService.getRewards('gift_cards');

// 3. Find affordable rewards
const affordable = rewards.data.filter(r => r.cost_coins <= userCoins);

// 4. Redeem a reward
const redemption = await rewardService.redeemReward(affordable[0].id);
console.log(`Code: ${redemption.data.redemptionCode}`);

// 5. View my rewards
const myRewards = await rewardService.getUserRewards();
```

---

## Integration with Existing Features

### Character System Integration
- Lesson completion awards XP
- XP updates character level
- Level updates character title
- Automatic level-up notifications

### Badge System Integration
- Missions can award badges
- Badge awarded on mission claim
- Badges visible in character profile

### Mountain/Expedition Integration
- Lessons belong to mountains
- Lessons unlock based on previous completion
- Mountain progress tracked via lesson completion

---

## Configuration

### Adding New Lesson Types

To add a new question type:

1. Add to enum in database:
```sql
ALTER TABLE exercise_questions
MODIFY question_type ENUM(..., 'new_type');
```

2. Create component:
```tsx
// NewTypeQuestion.tsx
export const NewTypeQuestion = ({ question, value, onChange }) => {
  // Implementation
};
```

3. Add to ExerciseLessonViewer:
```tsx
case 'new_type':
  return <NewTypeQuestion {...commonProps} />;
```

### Adding New Mission Triggers

1. Define target_type in mission_objectives
2. Call `updateMissionProgress` in relevant controller:
```typescript
await updateMissionProgress(connection, userId, 'new_trigger_type', incrementValue);
```

### Adding New Notification Types

1. Define type in notifications table
2. Create notification in relevant endpoint:
```typescript
await connection.query(
  `INSERT INTO notifications (user_id, type, title, message, icon)
   VALUES (?, ?, ?, ?, ?)`,
  [userId, 'new_type', 'Title', 'Message', '🎉']
);
```

3. Add icon mapping in NotificationBell component

---

## Testing

### Test Lesson Flow
1. Start XAMPP and ensure MySQL is running
2. Run backend: `npm run dev`
3. Run frontend: `npm run dev`
4. Navigate to lessons page
5. Complete a Read lesson
6. Complete an Exercise lesson
7. Check notifications
8. Check character XP increase

### Test Mission Flow
1. View missions dashboard
2. Complete actions (lessons, posts)
3. Check mission progress updates
4. Claim completed missions
5. Verify XP/coin rewards

### Test Social Flow
1. Create posts of different types
2. Like and comment on posts
3. Check notification for comments
4. Verify mission progress for post creation

### Test Reward Flow
1. Earn coins through lessons/missions
2. Browse reward shop
3. Redeem a reward
4. Check redemption code
5. View in "My Rewards" tab

---

## Performance Considerations

### Database Indexing
All tables include appropriate indexes:
- Foreign keys indexed
- User lookups optimized
- Status/type filters indexed

### API Optimization
- Pagination on feed and notifications
- Limit queries to necessary data
- Use of LEFT JOIN for optional data

### Frontend Optimization
- Lazy loading of comments
- Notification polling (30s interval)
- Optimistic UI updates for likes

---

## Troubleshooting

### Common Issues

**Lessons not showing**
- Check database connection
- Verify `lessons` table has data
- Check `is_active = true`

**Mission progress not updating**
- Verify `updateMissionProgress` called in controllers
- Check `mission_objectives.target_type` matches trigger
- Ensure mission is active

**Rewards can't be redeemed**
- Check user coin balance
- Verify stock availability
- Check reward is active

**Notifications not appearing**
- Check notification creation in endpoints
- Verify polling interval
- Check user_id matches

---

## Next Steps

### Potential Enhancements

1. **Real-time Updates**
   - WebSocket integration for live notifications
   - Real-time mission progress
   - Live feed updates

2. **Advanced Features**
   - Lesson prerequisites/dependencies
   - Mission chains
   - Reward categories and filtering
   - Social features (following, messaging)

3. **Analytics**
   - Lesson completion rates
   - User engagement metrics
   - Popular rewards
   - Social interaction analytics

4. **Admin Panel**
   - Lesson creation interface
   - Mission management
   - Reward inventory
   - User management

---

## Summary

The Levio features integration provides a complete learning and engagement ecosystem:

✅ **13 new database tables**
✅ **5 API endpoint groups** (Lessons, Missions, Social, Rewards, Notifications)
✅ **20+ frontend components**
✅ **Full integration** with existing character/badge/mountain systems
✅ **Sample data** included for testing
✅ **Comprehensive documentation**

All features work together to create an engaging, gamified learning experience! 🚀
