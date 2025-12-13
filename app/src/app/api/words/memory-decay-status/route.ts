/**
 * API: Memory Decay Status
 * GET /api/words/memory-decay-status
 *
 * Returns the status of the last memory decay execution
 * Shows when it ran and how many words were affected
 */

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/route-handlers";

const handler = withAuth(
  async (request: NextRequest & { user: { id: string } }) => {
    try {
      const supabase = await createSupabaseServerClient();

      // Get today's stats
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const { data: todayStats, error: todayError } = await supabase
        .from("daily_stats")
        .select(
          "stat_date, words_reviewed, words_marked_known, words_marked_review"
        )
        .eq("user_id", request.user.id)
        .eq("stat_date", today)
        .single();

      if (todayError && todayError.code !== "PGRST116") {
        throw todayError;
      }

      // Get last 7 days of history
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

      const { data: decayHistory, error: historyError } = await supabase
        .from("daily_stats")
        .select(
          "stat_date, words_reviewed, words_marked_known, words_marked_review"
        )
        .eq("user_id", request.user.id)
        .gte("stat_date", sevenDaysAgoStr)
        .order("stat_date", { ascending: false })
        .limit(7);

      if (historyError) {
        throw historyError;
      }

      // Calculate statistics
      const totalReviewed =
        decayHistory?.reduce(
          (sum, day) => sum + (day.words_reviewed ?? 0),
          0
        ) ?? 0;

      return NextResponse.json({
        today: {
          date: today,
          wordsReviewed: todayStats?.words_reviewed ?? 0,
          wordsMarkedKnown: todayStats?.words_marked_known ?? 0,
          hasActivityToday:
            !!todayStats && (todayStats.words_reviewed ?? 0) > 0,
        },
        lastSevenDays: {
          totalWordsReviewed: totalReviewed,
          avgPerDay:
            decayHistory && decayHistory.length > 0
              ? Math.round(totalReviewed / decayHistory.length)
              : 0,
          history: (decayHistory ?? []).map((day) => ({
            date: day.stat_date,
            reviewed: day.words_reviewed ?? 0,
            marked_known: day.words_marked_known ?? 0,
            marked_review: day.words_marked_review ?? 0,
          })),
        },
        nextScheduledRun: "Daily at 2:00 AM UTC",
      });
    } catch (error) {
      console.error("Memory decay status error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch memory decay status",
        },
        { status: 500 }
      );
    }
  }
);

export const GET = handler;
