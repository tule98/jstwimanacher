# Wordmaster Database Setup & Migration Guide

## Overview

This guide covers setting up the Wordmaster flashcard module with Supabase PostgreSQL.

## Prerequisites

- Supabase project already set up
- Supabase client configured in the app (`/lib/supabase/client.ts`)
- PostgreSQL 13+
- Database URL and service role key available

## Step 1: Create Tables & Schema

The schema is defined in:

- **Migration file**: `app/drizzle/migrations/0013_wordmaster_schema.sql`

### Option A: Via Supabase Dashboard (SQL Editor)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `app/drizzle/migrations/0013_wordmaster_schema.sql`
5. Execute the query
6. Verify all tables are created in the **Tables** section

### Option B: Via `psql` CLI

```bash
psql $DATABASE_URL < app/drizzle/migrations/0013_wordmaster_schema.sql
```

## Step 2: Verify Schema Creation

After running the migration, verify all tables exist:

```sql
-- Check tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%word%' OR tablename LIKE 'daily_stats' OR tablename LIKE 'review_history' OR tablename LIKE 'user_%';

-- Should return:
-- user_profiles
-- words
-- user_words
-- review_history
-- user_settings
-- daily_stats
```

## Step 3: Configure RLS Policies

The migration includes RLS policies, but verify they're enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'user_profiles', 'user_words', 'review_history', 'user_settings', 'daily_stats', 'words'
);

-- All should return `t` (true) for rowsecurity
```

## Step 4: Create Cron Job for Daily Decay

The daily memory decay runs via a Supabase Edge Function or webhook.

### Option A: Using Supabase Edge Function (Recommended)

1. Create a new Edge Function in Supabase:

   - Go to **Edge Functions**
   - Click **Create a new function**
   - Name: `wordmaster-daily-decay`
   - Runtime: TypeScript

2. Use this code:

```typescript
// supabase/functions/wordmaster-daily-decay/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from("user_settings")
      .select("user_id, daily_decay_rate");

    if (usersError) throw usersError;

    // For each user, apply daily decay
    for (const user of users || []) {
      const decayRate = user.daily_decay_rate || -1;

      // Update all non-mastered words with decay
      const { error: decayError } = await supabase.rpc(
        "apply_daily_decay_for_user",
        {
          p_user_id: user.user_id,
          p_decay_rate: decayRate,
        }
      );

      if (decayError)
        console.error(`Decay error for user ${user.user_id}:`, decayError);
    }

    return new Response(
      JSON.stringify({ success: true, usersProcessed: (users || []).length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Daily decay failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

3. Deploy the function
4. Set up a cron trigger in Supabase:
   - Go to **Edge Functions**
   - Find the function
   - Click the three dots menu
   - Set a schedule: `0 0 * * *` (Daily at 00:00 UTC)

### Option B: Using Database Function with Webhook

If Edge Functions aren't available, create a webhook-triggered function:

```sql
-- Create decay function for a specific user
CREATE OR REPLACE FUNCTION apply_daily_decay_for_user(
  p_user_id UUID,
  p_decay_rate INTEGER DEFAULT -1
)
RETURNS void AS $$
BEGIN
  UPDATE user_words
  SET
    memory_level = GREATEST(0, memory_level + p_decay_rate),
    last_memory_update_at = NOW()
  WHERE user_id = p_user_id
    AND memory_level > 0
    AND memory_level < 100;

  -- Update daily stats
  UPDATE daily_stats
  SET
    memory_points_lost = ABS(p_decay_rate) * (SELECT COUNT(*) FROM user_words WHERE user_id = p_user_id AND memory_level > 0),
    average_memory_level = (SELECT AVG(memory_level) FROM user_words WHERE user_id = p_user_id)
  WHERE user_id = p_user_id
    AND stat_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Then set up a webhook trigger via a third-party service like:

- **Netlify Functions** scheduled
- **AWS Lambda** with CloudWatch Events
- **Google Cloud Functions** with Pub/Sub
- Any HTTP-based cron service (e.g., EasyCron, Cron-job.org)

## Step 5: Initialize User Settings on Signup

When a new user signs up, auto-create their settings:

### Option A: Database Trigger

```sql
-- Trigger on auth.users table via webhook
CREATE OR REPLACE FUNCTION create_user_settings_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option B: Next.js API Route

Create `app/src/app/api/supabase/setup-user.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getSetCookie(),
        setAll: (cookies) => {
          /* ... */
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  // Create user settings
  await supabase.from("user_settings").insert({ user_id: userId });

  // Create user profile
  await supabase.from("user_profiles").insert({ user_id: userId });

  return new Response(JSON.stringify({ success: true }));
}
```

## Step 6: Test the Setup

### Test 1: Create a word

```typescript
import { wordmasterDb } from "@/services/wordmaster";

const word = await wordmasterDb.createWord({
  word_text: "serendipity",
  phonetic: "/ˌserənˈdɪpɪti/",
  definition: "The occurrence of events by chance in a happy or beneficial way",
  part_of_speech: "noun",
  example_sentence: "Finding that old photo was pure serendipity.",
  word_length: 11,
  difficulty_level: "very_hard",
});
```

### Test 2: Add word to user

```typescript
const userId = "your-user-id";
const userWord = await wordmasterDb.createUserWord(userId, {
  word_id: word.id,
  memory_level: 0,
});
```

### Test 3: Fetch feed

```typescript
const feed = await wordmasterDb.getFeedWords(userId, {
  page: 0,
  limit: 50,
  sortBy: "priority",
});
```

### Test 4: Record a review

```typescript
const review = await wordmasterDb.createReview(userId, {
  word_id: word.id,
  user_word_id: userWord.id,
  action_type: "marked_known",
  memory_before: 0,
  memory_after: 10,
  memory_change: 10,
});
```

## Troubleshooting

### Issue: RLS policies blocking queries

**Solution**: Ensure you're using an authenticated Supabase client with valid JWT token.

```typescript
const supabase = createBrowserClient(); // Must have valid session
```

### Issue: Can't insert words

**Solution**: Verify the `words_insert_policy` is enabled and user is authenticated.

```sql
SELECT * FROM pg_policies WHERE tablename = 'words';
```

### Issue: Daily decay not running

**Solution**: Check Edge Function logs in Supabase dashboard:

- **Functions** → **wordmaster-daily-decay** → **Logs**

### Issue: Memory level goes below 0

**Solution**: The `CHECK` constraint should prevent this. If it doesn't, verify constraints:

```sql
SELECT constraint_name, constraint_definition
FROM information_schema.check_constraints
WHERE table_name = 'user_words';
```

## Important Notes

1. **RLS is enabled** - All user data is isolated by row-level security
2. **Cascade deletes** - Deleting a user removes all their wordmaster data
3. **Indexes are critical** - Feed queries rely on composite indexes for performance
4. **Cron must run daily** - Without daily decay, memory system won't work as designed
5. **Supabase auth required** - This module requires Supabase authentication

## Next Steps

After database setup is complete:

1. **Core data layer & hooks** - Create React Query hooks
2. **Content extraction pipeline** - Build API route for word extraction
3. **Flashcard UI** - Build the feed and card components

See the main [Wordmaster Module Plan](../WORDMASTER_PLAN.md) for complete implementation roadmap.
