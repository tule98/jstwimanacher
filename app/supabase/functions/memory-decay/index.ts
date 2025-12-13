/**
 * Supabase Edge Function: Daily Memory Decay
 *
 * Runs daily to apply memory decay to words not reviewed recently
 * Prevents mastered words from dominating the feed
 *
 * Deploy with:
 * supabase functions deploy memory-decay --project-id YOUR_PROJECT_ID
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const DECAY_RATE_PER_DAY = 5; // 5% per day without review
const MASTERED_THRESHOLD = 80;
const DAYS_UNTIL_DECAY = 1; // Start decay after 1 day

serve(async (req: Request) => {
  try {
    // Verify this is a scheduled invocation or authorized request
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all user words that need decay
    const now = new Date();
    const decayThresholdDate = new Date(
      now.getTime() - DAYS_UNTIL_DECAY * 24 * 60 * 60 * 1000
    );

    const { data: userWords, error: fetchError } = await supabase
      .from("user_words")
      .select(
        "id, user_id, word_id, memory_level, last_reviewed_at, times_reviewed"
      )
      .lt("memory_level", MASTERED_THRESHOLD) // Only decay words not yet mastered
      .or(
        `last_reviewed_at.is.null,last_reviewed_at.lt.${decayThresholdDate.toISOString()}`
      );

    if (fetchError) {
      throw new Error(`Failed to fetch user words: ${fetchError.message}`);
    }

    if (!userWords || userWords.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          decayedCount: 0,
          message: "No words require decay",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate and apply decay
    const updates = userWords
      .map((uw: any) => {
        const lastReviewed = uw.last_reviewed_at
          ? new Date(uw.last_reviewed_at)
          : null;
        const now = new Date();

        // Calculate days since last review
        let daysSinceReview = 0;
        if (lastReviewed) {
          const diffTime = now.getTime() - lastReviewed.getTime();
          daysSinceReview = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        } else {
          // If never reviewed, assume it's been added today
          daysSinceReview = 0;
        }

        if (daysSinceReview < DAYS_UNTIL_DECAY) {
          return null; // Skip, not eligible for decay yet
        }

        // Calculate decay: 5% per day without review
        const decayDays = daysSinceReview - DAYS_UNTIL_DECAY;
        const decayPercentage = (decayDays * DECAY_RATE_PER_DAY) / 100;
        const newMemoryLevel = Math.max(
          0,
          uw.memory_level * (1 - decayPercentage)
        );

        return {
          id: uw.id,
          user_id: uw.user_id,
          word_id: uw.word_id,
          newMemoryLevel: Math.round(newMemoryLevel * 10) / 10, // Round to 1 decimal
          decayAmount: Math.round((uw.memory_level - newMemoryLevel) * 10) / 10,
        };
      })
      .filter((u: any) => u !== null);

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          decayedCount: 0,
          message: "No words eligible for decay today",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Batch update user words
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("user_words")
        .update({
          memory_level: update.newMemoryLevel,
          last_memory_update_at: new Date().toISOString(),
        })
        .eq("id", update.id);

      if (updateError) {
        console.error(`Failed to update word ${update.id}: ${updateError}`);
      }

      // Create decay record in review_history for tracking
      await supabase.from("review_history").insert({
        user_id: update.user_id,
        word_id: update.word_id,
        user_word_id: update.id,
        action_type: "system_decay",
        memory_before: 0, // Not tracked for system actions
        memory_after: 0,
        memory_change: -update.decayAmount,
      });
    }

    // Update daily stats (optional - for dashboard)
    const statsDate = now.toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: existingStats } = await supabase
      .from("daily_stats")
      .select("id, words_decayed")
      .eq("stat_date", statsDate)
      .limit(1)
      .single();

    if (existingStats) {
      await supabase
        .from("daily_stats")
        .update({
          words_decayed: (existingStats.words_decayed ?? 0) + updates.length,
        })
        .eq("id", existingStats.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        decayedCount: updates.length,
        totalDecayAmount:
          Math.round(
            updates.reduce((sum: number, u: any) => sum + u.decayAmount, 0) * 10
          ) / 10,
        message: `Applied decay to ${updates.length} words`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Memory decay function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
