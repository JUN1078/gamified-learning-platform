# 🧠 Culture Quest - Gamified Likert Insight Engine

## Table of Contents

1. [Philosophy](#philosophy)
2. [Feature Overview](#feature-overview)
3. [Gameplay Mechanics](#gameplay-mechanics)
4. [SOFT KPI Dimensions](#soft-kpi-dimensions)
5. [Technical Implementation](#technical-implementation)
6. [Setup Guide](#setup-guide)
7. [Integration](#integration)
8. [Analytics & Insights](#analytics--insights)
9. [Ethics & Privacy](#ethics--privacy)

---

## Philosophy

### Measurement Without Interruption

**Problem**: Traditional surveys are:
- ❌ Disruptive to learning flow
- ❌ Explicit and feel like assessments
- ❌ Low completion rates
- ❌ Subject to social desirability bias

**Solution**: Culture Quest
- ✅ Natural, contextual micro-interactions
- ✅ Gamified as "quests" not "surveys"
- ✅ Non-blocking, optional participation
- ✅ Implicit measurement through choices

### Core Principle

> **"We don't ask how you feel, we observe how you act."**

Culture Quest measures culture, mindset, and behavior through:
- Scenario-based decision making
- Emotional check-ins
- Value prioritization
- Natural interaction patterns

---

## Feature Overview

### What is Culture Quest?

Culture Quest is a **mini-game layer** integrated into the learning platform that:

1. **Appears naturally** in the learning flow
2. **Replaces formal surveys** with game mechanics
3. **Generates Likert-scale data** (1-5) for behavioral insights
4. **Rewards engagement** with XP and badges

### Key Components

| Component | Purpose | Trigger |
|-----------|---------|---------|
| **Scenario Choice** | Measure behavioral preferences | After lesson completion |
| **Emotion Check-in** | Track engagement levels | Post-lesson reflection |
| **Value Trade-off** | Understand priorities | Weekly intervals |
| **Micro Reflection** | Capture qualitative insights | Optional, non-blocking |

---

## Gameplay Mechanics

### 1. Scenario-Based Choice Game

**Format**: Contextual situations with multiple choice options

**Example**:
```
📋 Quest: Team Behind Schedule

Your team is behind on the project deadline. What do you do?

A. Focus on finishing my own tasks first
B. Initiate team discussion and ask for help
C. Wait for mentor guidance
D. Skip for now and continue later
```

**Behind the Scenes**:
- Option A → Ownership dimension, Likert: 3.0
- Option B → Collaboration dimension, Likert: 5.0
- Option C → Growth Mindset dimension, Likert: 2.0
- Option D → Resilience dimension, Likert: 1.0

**User Experience**:
- Framed as a realistic scenario
- No "right" or "wrong" answers
- Earns +10 XP regardless of choice
- Feels like narrative choice game

### 2. Emotion Check-in (Soft Likert)

**Format**: Emoji-based mood meter

**Example**:
```
🎭 How do you feel after this lesson?

😐   😶   🙂   😄   🚀
Neutral Unsure Good Great Excited
```

**Behind the Scenes**:
- Each emoji maps to Likert 1-5
- Measures Learning Engagement dimension
- Instant submission (no confirm button needed)

**User Experience**:
- Takes 2 seconds
- Visual and intuitive
- No cognitive load
- Feels expressive, not evaluative

### 3. Value Trade-off Cards

**Format**: Choose top priority value

**Example**:
```
⚖️ Which value do you prioritize most in your work?

🚀        🎯        🤝        🌱
Speed   Accuracy Collaboration Exploration
```

**Behind the Scenes**:
- Each value maps to a dimension
- Weighted Likert scoring
- Tracks preference patterns over time

**User Experience**:
- Visual card-based selection
- Feels like personality quiz
- No text-heavy questions
- Gamified aesthetic

### 4. Micro Reflection Quest (Optional)

**Format**: Single-sentence input

**Example**:
```
✍️ This lesson was most useful because...
[                                    ]
(Optional - skip if you prefer)
```

**Behind the Scenes**:
- Light sentiment analysis (positive/neutral/negative)
- Confidence score from text length/detail
- Optional, never mandatory

**User Experience**:
- Can be skipped
- Rewards extra XP if completed
- Feels like journaling, not survey

---

## SOFT KPI Dimensions

### The 6 Core Dimensions

Culture Quest tracks 6 behavioral dimensions:

#### 1. 🚀 Learning Engagement
**Definition**: Enthusiasm and consistency in learning

**Measured by**:
- Emotion check-in responses
- Lesson completion rate
- Voluntary quest participation
- Time spent per module

**Likert Scale**:
- 1 = Disengaged
- 3 = Moderately engaged
- 5 = Highly enthusiastic

#### 2. 🌱 Growth Mindset
**Definition**: Willingness to learn and improve

**Measured by**:
- Response to failure scenarios
- Help-seeking behavior
- Challenge acceptance
- Feedback receptiveness

**Likert Scale**:
- 1 = Fixed mindset
- 3 = Mixed attitudes
- 5 = Strong growth orientation

#### 3. 🎯 Ownership
**Definition**: Proactive vs passive behavior

**Measured by**:
- Initiative in scenarios
- Self-directed learning choices
- Problem-solving approach
- Accountability indicators

**Likert Scale**:
- 1 = Passive/reactive
- 3 = Situationally proactive
- 5 = Consistently self-driven

#### 4. 🤝 Collaboration
**Definition**: Preference for teamwork

**Measured by**:
- Teamwork scenario choices
- Value prioritization
- Social interaction patterns
- Peer engagement

**Likert Scale**:
- 1 = Prefers solo work
- 3 = Balanced
- 5 = Strongly collaborative

#### 5. 💪 Resilience
**Definition**: Response to failure and challenges

**Measured by**:
- Retry behavior after failure
- Skip vs persist patterns
- Challenge difficulty preferences
- Setback recovery

**Likert Scale**:
- 1 = Easily discouraged
- 3 = Moderate persistence
- 5 = Highly resilient

#### 6. ⭐ Cultural Alignment
**Definition**: Fit with organizational values

**Measured by**:
- Aggregate of all dimensions
- Value trade-off patterns
- Behavioral consistency
- Mission alignment

**Likert Scale**:
- 1 = Low alignment
- 3 = Moderate fit
- 5 = Strong alignment

---

## Technical Implementation

### Database Schema

#### Tables Created

**1. `culture_dimensions`**
```sql
- id (VARCHAR) PRIMARY KEY
- name (VARCHAR)
- description (TEXT)
- icon (VARCHAR) - emoji
- color (VARCHAR) - hex code
- weight (DECIMAL) - scoring weight
```

**2. `culture_scenarios`**
```sql
- id (INT) AUTO_INCREMENT PRIMARY KEY
- type (ENUM: scenario/emotion/value_tradeoff/reflection)
- title (VARCHAR)
- description (TEXT)
- context (VARCHAR) - when to trigger
- trigger_after (VARCHAR) - event trigger
- is_active (BOOLEAN)
```

**3. `culture_scenario_options`**
```sql
- id (INT) AUTO_INCREMENT PRIMARY KEY
- scenario_id (INT) FOREIGN KEY
- option_text (TEXT)
- option_label (VARCHAR) - A, B, C, D
- emoji (VARCHAR) - for emotion/value types
- dimension_id (VARCHAR) FOREIGN KEY
- likert_value (DECIMAL) - 1.0 to 5.0
- option_order (INT)
```

**4. `culture_responses`**
```sql
- id (INT) AUTO_INCREMENT PRIMARY KEY
- user_id (INT) FOREIGN KEY
- scenario_id (INT) FOREIGN KEY
- option_id (INT) FOREIGN KEY
- dimension_id (VARCHAR) FOREIGN KEY
- likert_value (DECIMAL)
- context_data (JSON) - metadata
- completed_at (TIMESTAMP)
```

**5. `user_culture_scores`** (Aggregated)
```sql
- id (INT) AUTO_INCREMENT PRIMARY KEY
- user_id (INT) FOREIGN KEY
- dimension_id (VARCHAR) FOREIGN KEY
- current_score (DECIMAL) - normalized 0-1
- response_count (INT)
- last_updated (TIMESTAMP)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/culture-quest/scenarios` | Get active quests |
| POST | `/api/culture-quest/response` | Submit quest response |
| GET | `/api/culture-quest/scores` | User's culture scores |
| GET | `/api/culture-quest/radar` | Radar chart data |
| GET | `/api/culture-quest/analytics/organization` | Org-level analytics |
| GET | `/api/culture-quest/analytics/trend/:dimensionId` | Dimension trend |

### Scoring Algorithm

**Individual Score Formula**:
```javascript
dimension_score = AVG(all_likert_values_for_dimension) / 5
// Normalized to 0-1 scale
```

**Engagement Score Formula**:
```javascript
engagement_score = (
  emotion_checkin_avg * 0.40 +
  lesson_completion_rate * 0.30 +
  voluntary_quest_participation * 0.30
)
```

**Cultural Alignment Index**:
```javascript
alignment_index = Σ(scenario_choice_weight × frequency) / total_scenarios
```

---

## Setup Guide

### Step 1: Run Database Migration

```bash
cd backend
npm run db:init
npm run tsx src/scripts/addCultureQuest.ts
```

This creates all Culture Quest tables and inserts sample data.

### Step 2: Verify Installation

Check MySQL:
```sql
USE learnhub_gamification;
SHOW TABLES LIKE 'culture%';

-- Should show:
-- culture_dimensions
-- culture_scenarios
-- culture_scenario_options
-- culture_responses
-- user_culture_scores
```

### Step 3: Add Sample Scenarios (Optional)

The init script adds 3 sample scenarios. To add more:

```sql
INSERT INTO culture_scenarios (type, title, description, context, trigger_after)
VALUES ('scenario', 'Your Custom Scenario', 'Description here', 'after_lesson', 'lesson_complete');

-- Get the scenario_id, then add options:
INSERT INTO culture_scenario_options (scenario_id, option_text, dimension_id, likert_value, option_order)
VALUES (1, 'Option A text', 'collaboration', 5.0, 1);
```

### Step 4: Restart Backend

```bash
npm run dev
```

Backend now includes Culture Quest routes.

---

## Integration

### Trigger Culture Quest After Lesson

**In your lesson completion handler**:

```typescript
// frontend/src/pages/LessonComplete.tsx
import { useCultureQuestStore } from '@/stores/cultureQuestStore';
import { cultureQuestService } from '@/services/cultureQuestService';

const LessonComplete = () => {
  const { setCurrentScenario, openQuestModal } = useCultureQuestStore();

  useEffect(() => {
    const triggerQuest = async () => {
      // Fetch scenario (10% chance to trigger)
      if (Math.random() < 0.1) {
        const scenarios = await cultureQuestService.getScenarios('after_lesson', 1);
        if (scenarios.length > 0) {
          setCurrentScenario(scenarios[0]);
          openQuestModal();
        }
      }
    };

    triggerQuest();
  }, []);

  return <div>Lesson Complete!</div>;
};
```

### Add to Main App

**In `App.tsx`**:

```typescript
import CultureQuestModal from './components/cultureQuest/CultureQuestModal';

function App() {
  return (
    <>
      {/* ... other components ... */}
      <CultureQuestModal />
    </>
  );
}
```

### Add Culture Profile Page

Create new route:

```typescript
// frontend/src/pages/CultureProfile.tsx
import CultureRadarChart from '@/components/cultureQuest/CultureRadarChart';

const CultureProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Your Culture Profile</h1>
      <CultureRadarChart />
    </div>
  );
};

export default CultureProfile;
```

---

## Analytics & Insights

### Individual Dashboard

**What users see**:
- 6-dimension radar chart
- Score vs cohort average
- Response count per dimension
- Trend over time
- Personalized insights

**Example Insights**:
```
💡 Your collaboration score is 20% above average!
   You excel at teamwork and peer support.

📈 Your growth mindset increased by 0.8 this month.
   Keep embracing challenges!
```

### Organization Dashboard (Admin)

**Aggregate Metrics**:
- Average scores per dimension
- Participation rate
- Response trends over time
- Dimension heatmap by department
- Cultural alignment distribution

**Export Data**:
```sql
-- Get org-wide dimension averages
SELECT
  cd.name,
  AVG(ucs.current_score) * 5 as avg_score,
  COUNT(DISTINCT ucs.user_id) as user_count
FROM culture_dimensions cd
LEFT JOIN user_culture_scores ucs ON cd.id = ucs.dimension_id
GROUP BY cd.id, cd.name;
```

---

## Ethics & Privacy

### Principles

1. **Anonymity at Scale**
   - Individual responses are private
   - Only aggregated data shown to organization
   - No person-identifiable insights shared

2. **Transparent Purpose**
   - Users know why quests exist
   - Clear communication about data use
   - Opt-out always available

3. **No Punitive Use**
   - Culture data NEVER used for performance reviews
   - Strictly for improvement and insights
   - Positive reinforcement only

4. **Voluntary Participation**
   - All quests can be skipped
   - No penalties for non-participation
   - XP rewards are bonus, not required

### User Communication

**Dashboard Notice**:
```
🔒 Your Privacy

Culture Quest responses are:
✓ Used to improve your learning experience
✓ Aggregated for organizational insights
✓ Never shared individually
✓ Completely optional

You can skip any quest without penalty.
```

---

## Best Practices

### DO ✅

- Keep scenarios contextual and realistic
- Use visual elements (emojis, cards)
- Reward all responses equally
- Make quests feel like games
- Update scenarios regularly
- Show users their own data

### DON'T ❌

- Don't overuse quests (max 1-2 per session)
- Don't make quests mandatory
- Don't use data punitively
- Don't ask sensitive personal questions
- Don't show individual data to managers
- Don't interrupt critical learning moments

---

## Roadmap

### Phase 1 (Complete) ✅
- 6 core dimensions
- 3 quest types (scenario, emotion, value)
- Individual radar chart
- Basic analytics

### Phase 2 (Next)
- Reflection quest with NLP
- Team-based quests
- Peer comparison (opt-in)
- Badge rewards for cultural excellence

### Phase 3 (Future)
- AI-powered insights
- Personalized quest generation
- Predictive analytics
- Culture matching for teams

---

## Support & Documentation

For questions or issues:
- Check this guide first
- Review sample scenarios in database
- Test with dummy data before production
- Monitor participation rates weekly

---

**Built with ❤️ for next-generation behavioral analytics**
