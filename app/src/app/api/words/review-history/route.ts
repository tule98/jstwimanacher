/**
 * API: Review History
 * GET /api/words/review-history
 *
 * Returns daily review statistics for the past 30 days
 * Shows words reviewed, marked known, marked for review
 */

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/route-handlers";

const handler = withAuth(
  async (request: NextRequest & { user: { id: string } }) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const supabase = await createSupabaseServerClient();

      // Get last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: reviewHistory, error } = await supabase
        .from("daily_stats")
        .select(
          "stat_date, words_reviewed, words_marked_known, words_marked_review"
        )
        .eq("user_id", userId)
        .gte("stat_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("stat_date", { ascending: true });

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Format data for chart
      const chartData = (reviewHistory ?? []).map((day) => ({
        date: new Date(day.stat_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        reviewed: day.words_reviewed ?? 0,
        marked_known: day.words_marked_known ?? 0,
        marked_review: day.words_marked_review ?? 0,
      }));

      // Calculate totals
      const totals = {
        totalReviewed: (reviewHistory ?? []).reduce(
          (sum, day) => sum + (day.words_reviewed ?? 0),
          0
        ),
        totalLearned: (reviewHistory ?? []).reduce(
          (sum, day) => sum + (day.words_marked_known ?? 0),
          0
        ),
        avgMarkedReview: (reviewHistory ?? []).reduce(
          (sum, day) => sum + (day.words_marked_review ?? 0),
          0
        ),
      };

      return NextResponse.json({
        data: chartData,
        totals,
      });
    } catch (error) {
      console.error("Review history error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch review history",
        },
        { status: 500 }
      );
    }
  }
);

export const GET = handler;
