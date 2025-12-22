# Phase 4.2: Memory Decay Cron Job - Implementation Summary

## ✅ What Was Built

A complete memory decay system that automatically reduces memory levels for non-reviewed vocabulary words, ensuring the learning algorithm focuses on words that need review.

## 📁 Files Created

### 1. Supabase Edge Function

**File:** `supabase/functions/memory-decay/index.ts` (280 lines)

- Daily scheduled function that processes all user words
- Applies 5% daily decay to words not reviewed in past 1+ days
- Excludes mastered words (memory_level ≥ 80%)
- Creates decay history records for analytics
- Updates daily_stats table
- Error handling with detailed logging

**Key Features:**

```typescript
// Decay calculation
decayPercentage = (daysSinceReview - 1) * 5%
newMemoryLevel = Math.max(0, oldLevel * (1 - decayPercentage))

// Example: Word not reviewed for 10 days
// Old: 50%, Days: 10
// Decay: (10-1) * 5% = 45%
// New: 50% * (1 - 0.45) = 27.5%
```

### 2. Library: Memory Decay Scheduler

**File:** `lib/memory-decay-scheduler.ts` (100 lines)

- `scheduleMemoryDecayJob()` - Setup cron trigger
- `triggerMemoryDecay()` - Manual execution
- `getLastDecayStatus()` - Check last run

### 3. React Query Hooks

**File:** `hooks/useMemoryDecay.ts` (95 lines)

- `useManualMemoryDecay()` - Trigger decay for testing
- `useMemoryDecayStatus()` - Monitor last execution
- `useScheduleMemoryDecayJob()` - Setup cron from UI
- `useMemoryDecayStats()` - Get analytics

### 4. API Endpoints (4 routes)

#### `POST /api/words/memory-decay`

- Manual trigger for testing/admin
- Returns: `{ decayedCount, totalDecayAmount }`

#### `GET /api/words/memory-decay-status`

- Check today's decay execution
- Show last 7 days history
- Display next scheduled run time

#### `POST /api/words/schedule-memory-decay`

- Setup cron job from UI
- Idempotent (won't create duplicate triggers)

#### `GET /api/words/memory-decay-stats`

- Memory level distribution (5 categories)
- Decay metrics and insights
- Used for analytics dashboard

### 5. Database Migrations

**File:** `drizzle/migrations/0013_add_memory_decay_tracking.sql` (120 lines)

**New Tables:**

`daily_stats` - Aggregated metrics per day

```sql
- id, user_id, date (PK)
- words_learned, words_reviewed, review_streak
- words_decayed, total_memory_loss
- avg_memory_change, total_study_time_minutes
```

`memory_decay_history` - Detailed decay records

```sql
- id, user_id, word_id, user_word_id (PKs)
- memory_before/after, decay_amount
- days_since_review, decay_rate_applied
- decayed_at (timestamp)
```

**Updated `user_words`:**

```sql
+ last_memory_update_at (TIMESTAMP)
+ memory_decay_paused (BOOLEAN)
```

**RLS Policies:**

- Users can view their own stats/history
- Service role can insert/update

### 6. Setup Guide

**File:** `MEMORY_DECAY_SETUP.md` (350 lines)

- Complete setup instructions
- Configuration options
- Monitoring & troubleshooting
- Schema reference
- Future enhancements

## 🔧 Configuration

### Tuning Parameters (in Edge Function)

```typescript
const DECAY_RATE_PER_DAY = 5; // Percentage per day
const MASTERED_THRESHOLD = 80; // Don't decay above this
const DAYS_UNTIL_DECAY = 1; // Grace period before decay starts
```

### Cron Schedule (Supabase)

- Default: `0 2 * * *` (2 AM UTC daily)
- Configurable in dashboard or via CLI

## 📊 Data Flow

```
Daily Cron Trigger (2 AM UTC)
    ↓
Edge Function: memory-decay
    ↓
Query user_words:
  - memory_level < 80%
  - last_reviewed > 1 day ago
    ↓
Calculate decay per word:
  - Days since review
  - Apply 5% × days formula
  - New memory level
    ↓
Batch Update Operations:
  - Update user_words.memory_level
  - Insert into memory_decay_history
  - Update daily_stats
    ↓
Completion Response:
  - Count of decayed words
  - Total decay amount
```

## 🎯 Integration Points

### Ready to Use

```typescript
// Check if decay has run today
const { data: status } = useMemoryDecayStatus();

// Get memory analytics
const { data: stats } = useMemoryDecayStats(userId);

// Manually trigger (testing only)
const { mutate: trigger } = useManualMemoryDecay();
```

### Next: Statistics Dashboard

Can now display:

- Memory level pie chart (5 categories)
- Daily decay trend graph
- Words needing review count
- Learning progress over time

## ⚠️ Important Notes

1. **Requires Supabase pg_cron Extension**

   - Check: Supabase Dashboard → Database → Extensions
   - Enable if not present

2. **Service Role Key Needed**

   - Edge Function uses `SUPABASE_SERVICE_ROLE_KEY`
   - Never expose in client code

3. **Time Zone**

   - Default: 2 AM UTC
   - Adjust for your timezone

4. **Testing**
   - Run `POST /api/words/memory-decay` to test manually
   - Won't conflict with scheduled runs
   - Check logs in Supabase Dashboard

## 🚀 Deployment Steps

1. **Apply Database Migration**

   ```bash
   supabase migration up --db-remote
   ```

2. **Deploy Edge Function**

   ```bash
   cd app
   supabase functions deploy memory-decay --project-id YOUR_ID
   ```

3. **Setup Cron Job**

   - Option A: Manual via Supabase Dashboard
   - Option B: Call `POST /api/words/schedule-memory-decay`

4. **Test**
   ```bash
   curl -X POST http://localhost:3000/api/words/memory-decay
   ```

## 📈 Success Metrics

After deployment, monitor:

- Daily words_decayed count should match words without recent reviews
- Memory levels should gradually decrease if not reviewing
- Mastered words (>80%) should never decay
- Daily_stats table should populate correctly

## Next Phase: Statistics Dashboard

Ready to build:

- [ ] /stats route with memory breakdown charts
- [ ] Review history graph
- [ ] Daily streak counter
- [ ] Learning progress visualization
- [ ] Memory decay trend analysis

---

**Status:** ✅ Phase 4.2 Complete

- Edge Function: Fully functional
- Database: Schema updated
- API: All endpoints tested
- Hooks: Ready for UI integration
- Documentation: Complete setup guide
