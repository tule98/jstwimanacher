# Memory Decay System Setup Guide

## Overview

The Memory Decay system automatically reduces the memory level of vocabulary words that haven't been reviewed recently. This ensures the learning algorithm focuses on words that need review while not wasting time on mastered content.

## System Architecture

### Components

1. **Supabase Edge Function** (`supabase/functions/memory-decay/index.ts`)

   - Runs daily at scheduled time
   - Applies 5% daily decay to non-mastered words
   - Tracks decay history for analytics

2. **Database Schema** (Migration `0013_add_memory_decay_tracking.sql`)

   - `daily_stats`: Aggregated metrics per day per user
   - `memory_decay_history`: Detailed decay records
   - Updates to `user_words`: tracking fields

3. **API Endpoints**

   - `POST /api/words/memory-decay` - Manual trigger (testing)
   - `GET /api/words/memory-decay-status` - Check last run
   - `POST /api/words/schedule-memory-decay` - Setup cron job
   - `GET /api/words/memory-decay-stats` - Analytics

4. **React Query Hooks** (`hooks/useMemoryDecay.ts`)
   - `useManualMemoryDecay()` - Trigger decay manually
   - `useMemoryDecayStatus()` - Check last execution
   - `useScheduleMemoryDecayJob()` - Setup cron
   - `useMemoryDecayStats()` - Get analytics

## Decay Algorithm

```
For each word with memory_level < 80% AND last_reviewed > 1 day ago:
  days_since_review = NOW() - last_reviewed_at
  decay_percentage = (days_since_review - 1) * 5%
  new_memory_level = memory_level * (1 - decay_percentage)
  new_memory_level = max(0, new_memory_level)
```

### Example

- Word added 10 days ago, never reviewed
- Current memory_level: 50%
- Days without review: 10
- Decay: (10 - 1) \* 5% = 45%
- New level: 50% \* (1 - 0.45) = 27.5%

## Setup Instructions

### Step 1: Run Database Migration

```bash
# Apply migration to your Supabase database
supabase migration up --db-remote
```

Or manually run the SQL in Supabase SQL Editor:

- File: `app/drizzle/migrations/0013_add_memory_decay_tracking.sql`

### Step 2: Deploy Edge Function

```bash
# From app directory
cd app

# Deploy the memory decay function
supabase functions deploy memory-decay \
  --project-id YOUR_PROJECT_ID \
  --no-verify-jwt  # Optional: remove if you have auth setup

# Verify deployment
supabase functions list --project-id YOUR_PROJECT_ID
```

### Step 3: Setup Cron Job

Option A: Manual (via Supabase Dashboard)

1. Go to Supabase Dashboard → Database → Functions
2. Create new function trigger on `memory-decay`
3. Set schedule: `0 2 * * *` (Daily at 2 AM UTC)

Option B: Programmatic (via API)

```bash
curl -X POST http://localhost:3000/api/words/schedule-memory-decay \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Test Manually

```bash
# Trigger decay once to test
curl -X POST http://localhost:3000/api/words/memory-decay \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"

# Check status
curl http://localhost:3000/api/words/memory-decay-status \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Get analytics
curl http://localhost:3000/api/words/memory-decay-stats \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Configuration

### Decay Rate

Edit `supabase/functions/memory-decay/index.ts`:

```typescript
const DECAY_RATE_PER_DAY = 5; // 5% per day (adjust as needed)
const MASTERED_THRESHOLD = 80; // Don't decay words above 80%
const DAYS_UNTIL_DECAY = 1; // Start decay after 1 day
```

### Schedule

Edit cron schedule in Supabase Dashboard or CLI:

- Default: `0 2 * * *` (2 AM UTC daily)
- Other options:
  - `0 * * * *` (Every hour)
  - `0 0 * * 0` (Weekly on Sunday)
  - `0 0 1 * *` (Monthly on 1st)

## Monitoring & Analytics

### Check Daily Decay Status

```typescript
import { useMemoryDecayStatus } from "@/hooks/useMemoryDecay";

function DecayStatusWidget() {
  const { data: status } = useMemoryDecayStatus();

  return (
    <div>
      <h3>Today's Decay</h3>
      <p>Words decayed: {status?.today.wordsDecayed}</p>
      <p>Average (7d): {status?.lastSevenDays.avgPerDay}</p>
    </div>
  );
}
```

### View Memory Distribution

```typescript
import { useMemoryDecayStats } from "@/hooks/useMemoryDecay";

function MemoryStats() {
  const { data: stats } = useMemoryDecayStats(userId);

  return (
    <div>
      <h3>Memory Levels</h3>
      <p>Mastered: {stats?.memoryLevelDistribution.mastered.count}</p>
      <p>Strong: {stats?.memoryLevelDistribution.strong.count}</p>
      <p>Average: {stats?.memoryLevelDistribution.average.count}</p>
      <p>Weak: {stats?.memoryLevelDistribution.weak.count}</p>
    </div>
  );
}
```

## Troubleshooting

### Cron Job Not Running

1. Verify function deployment:

   ```bash
   supabase functions list --project-id YOUR_PROJECT_ID
   ```

2. Check function logs:

   - Supabase Dashboard → Edge Functions → memory-decay → Recent Executions

3. Ensure cron trigger exists:
   - Supabase Dashboard → Database → Cron Jobs (if pg_cron is enabled)

### Decay Not Applying

1. Verify migration was applied:

   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'daily_stats';
   ```

2. Check user_words data:

   ```sql
   SELECT COUNT(*) FROM user_words
   WHERE last_reviewed_at IS NULL
   OR last_reviewed_at < NOW() - INTERVAL '1 day';
   ```

3. Run manual trigger and check response:
   ```bash
   curl -X POST http://localhost:3000/api/words/memory-decay \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Performance Issues

If decay function is slow:

1. Add index on user_words:

   ```sql
   CREATE INDEX IF NOT EXISTS idx_user_words_memory
   ON user_words(memory_level, last_reviewed_at);
   ```

2. Batch process by date range instead of all users at once

3. Consider running at off-peak hours (change cron schedule)

## Future Enhancements

- [ ] Configurable decay curves (linear vs exponential)
- [ ] Pause decay during active learning sessions
- [ ] Decay boost for frequently reviewed words (retention bonus)
- [ ] Weekend exception (no decay on weekends)
- [ ] User preferences for decay rate
- [ ] Decay notifications ("Your memory for X is declining")

## Database Schema Reference

### daily_stats

```
id: UUID (PK)
user_id: UUID (FK → profiles)
date: DATE
words_learned: INT
words_reviewed: INT
review_streak: INT
words_decayed: INT
total_memory_loss: DECIMAL
avg_memory_change: DECIMAL
total_study_time_minutes: INT
```

### memory_decay_history

```
id: UUID (PK)
user_id: UUID (FK → profiles)
word_id: UUID (FK → words)
user_word_id: UUID (FK → user_words)
memory_before: DECIMAL
memory_after: DECIMAL
decay_amount: DECIMAL
days_since_review: INT
decay_rate_applied: DECIMAL
decayed_at: TIMESTAMP
```

### user_words (updated)

```
+ last_memory_update_at: TIMESTAMP
+ memory_decay_paused: BOOLEAN
```
