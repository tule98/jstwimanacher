# Phase 4 Quick Reference Guide

## 🎯 What's New

### 1. Interactions (Phase 4.1)

**Files:** `lib/interactions.ts`, `lib/toast-context.tsx`, `WordsFeed.tsx`

- **Swipe Detection:** Swipe left/right on cards
  ```typescript
  setupSwipeDetection(element, {
    onSwipeLeft: () => handleNext(),
    onSwipeRight: () => handlePrevious(),
  });
  ```
- **Haptic Feedback:** Vibration patterns
  ```typescript
  triggerHaptic("medium"); // Success
  triggerHaptic("error"); // Failure
  ```
- **Toast Notifications:** User feedback
  ```typescript
  const toast = useToast();
  toast.success("✓ Marked as known!");
  toast.error("Failed to update");
  ```

### 2. Memory Decay (Phase 4.2)

**Files:** `supabase/functions/memory-decay/`, `hooks/useMemoryDecay.ts`

**How it works:**

- Runs daily at 2 AM UTC
- Reduces memory by 5% for each day not reviewed
- Only affects words below 80% memory
- Tracked in `daily_stats` and `memory_decay_history`

**Hooks:**

```typescript
const { mutate: trigger } = useManualMemoryDecay(); // Test
const { data: status } = useMemoryDecayStatus(); // Info
const { data: stats } = useMemoryDecayStats(userId); // Analytics
```

**Manual trigger (testing):**

```bash
curl -X POST http://localhost:3000/api/words/memory-decay
```

### 3. Analytics Dashboard (Phase 4.3)

**Files:** `wordmaster/stats/page.tsx`, `wordmaster/stats/_components/`

**Access:** Click 📊 Stats button on main wordmaster page

**Displays:**

- 4 quick stat cards (total, mastered, need review, decayed)
- Memory level distribution pie chart
- 7-day decay trend line chart
- 30-day review activity bar chart
- Dynamic learning insights & tips
- Progress bars for mastery & review status

---

## 📊 New Database Tables

### `daily_stats`

```sql
SELECT * FROM daily_stats
  WHERE user_id = 'xxx'
  ORDER BY date DESC
  LIMIT 7;
```

Shows: words learned, reviewed, decayed each day

### `memory_decay_history`

```sql
SELECT * FROM memory_decay_history
  WHERE user_id = 'xxx'
  ORDER BY decayed_at DESC;
```

Shows: detailed decay records for each word

### Updated `user_words`

```sql
ALTER TABLE user_words ADD COLUMN last_memory_update_at TIMESTAMP;
ALTER TABLE user_words ADD COLUMN memory_decay_paused BOOLEAN;
```

---

## 🚀 Deployment Steps

### 1. Database

```bash
# Apply migration
supabase migration up --db-remote

# Verify tables created
supabase db list
```

### 2. Edge Function

```bash
cd app
supabase functions deploy memory-decay --project-id YOUR_PROJECT_ID

# Verify deployment
supabase functions list
```

### 3. Cron Job

**Option A: Manual (Dashboard)**

1. Go to Supabase → Functions → memory-decay
2. Create trigger
3. Schedule: `0 2 * * *` (2 AM UTC daily)

**Option B: Programmatic**

```typescript
const { mutate: schedule } = useScheduleMemoryDecayJob();
schedule();
```

### 4. Test

```bash
# Manual trigger
curl -X POST http://localhost:3000/api/words/memory-decay \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check status
curl http://localhost:3000/api/words/memory-decay-status
```

---

## 🛠️ Configuration

### Memory Decay Rate

**File:** `supabase/functions/memory-decay/index.ts`

```typescript
const DECAY_RATE_PER_DAY = 5; // Change to 3 for slower decay
const MASTERED_THRESHOLD = 80; // Don't decay above this
const DAYS_UNTIL_DECAY = 1; // Grace period
```

### Cron Schedule

**Default:** `0 2 * * *` (2 AM UTC daily)

**Alternatives:**

```
0 * * * *     → Every hour
0 12 * * *    → Daily at 12 PM UTC
0 0 * * 0     → Weekly on Sunday
0 0 1 * *     → Monthly on 1st
```

---

## 🐛 Troubleshooting

### Haptic not working

- Check browser console for errors
- Verify device supports Vibration API
- Test: `navigator.vibrate(20)` in console
- Works on: Android (most), iOS (limited)

### Decay not running

```bash
# Check function logs
supabase functions logs memory-decay --project-id YOUR_PROJECT_ID

# Manual test
curl -X POST http://localhost:3000/api/words/memory-decay
```

### Stats page blank

- Check network tab for API errors
- Verify `useMemoryDecayStats()` gets userId
- Check user has words in database
- Inspect console for React errors

### Toast not showing

- Verify `AppProvider` wraps app
- Check `ToastProvider` is present
- Test: `useToast().success("Test")`

---

## 📈 Key Metrics

### Memory Levels

- 0-20%: Very Weak (🔴)
- 20-40%: Weak (🟠)
- 40-60%: Average (🟡)
- 60-80%: Strong (🔵)
- 80-100%: Mastered (🟢)

### Decay Example

```
Day 1: Added word, memory = 50%
Day 5: Not reviewed
Day 8: Not reviewed
Day 10: Decay runs
  Days since review: 10
  Decay percentage: (10-1) × 5% = 45%
  New memory: 50% × (1-0.45) = 27.5%
```

---

## 🔗 Important Files

**Interactions:**

- `lib/interactions.ts` - Gesture & haptic library
- `lib/toast-context.tsx` - Toast system
- `WordsFeed.tsx` - Integration

**Memory Decay:**

- `supabase/functions/memory-decay/` - Edge function
- `hooks/useMemoryDecay.ts` - React hooks
- `api/words/memory-decay*` - API endpoints
- `drizzle/migrations/0013_*` - Database schema

**Analytics:**

- `wordmaster/stats/page.tsx` - Main page
- `wordmaster/stats/_components/` - Chart components
- `api/words/review-history` - Data API

---

## 📚 Documentation

- `MEMORY_DECAY_SETUP.md` - Complete setup guide
- `PHASE_4_COMPLETE.md` - Full Phase 4 overview
- `PHASE_4_1_SUMMARY.md` - Interactions details
- `PHASE_4_2_SUMMARY.md` - Memory decay details
- `PHASE_4_3_SUMMARY.md` - Analytics details

---

## 🎯 Testing Checklist

- [ ] Swipe left/right on flashcard
- [ ] Haptic feedback triggers on action
- [ ] Toast appears and auto-dismisses
- [ ] Stats page loads with data
- [ ] Charts animate smoothly
- [ ] Memory decay runs overnight
- [ ] Decay history records appear
- [ ] Daily stats update correctly
- [ ] Mobile layout responsive
- [ ] No errors in console

---

## 💡 Usage Examples

### Using Swipe Gestures

```typescript
const cardRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const cleanup = setupSwipeDetection(cardRef.current, {
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });
  return cleanup;
}, []);

return <Box ref={cardRef}>Card content</Box>;
```

### Providing Haptic Feedback

```typescript
const handleAction = async () => {
  try {
    triggerHaptic("medium"); // User knows action started
    await mutation.mutateAsync();
    triggerHaptic("success"); // Success confirmation
    toast.success("Done!");
  } catch (err) {
    triggerHaptic("error"); // Error feedback
    toast.error("Failed");
  }
};
```

### Checking Decay Stats

```typescript
const { data: stats } = useMemoryDecayStats(userId);

if (stats) {
  console.log("Mastered:", stats.memoryLevelDistribution.mastered.count);
  console.log("Eligible for decay:", stats.decayMetrics.eligibleForDecay);
  console.log("Decay runs at:", stats.decayMetrics.nextDecayRun);
}
```

---

## 🚀 Next Steps

1. **Deploy to Supabase**

   - Apply migration
   - Deploy Edge Function
   - Setup cron job

2. **Test thoroughly**

   - Mobile device testing
   - Network throttling
   - Long-term stability

3. **Monitor**

   - Check Edge Function logs
   - Monitor API performance
   - Track error rates

4. **Optimize**
   - Add more spaced repetition options
   - Implement streak system
   - Add gamification elements

---

**Status:** Phase 4 Complete ✅ Ready for Phase 5 (Testing & Deployment)
