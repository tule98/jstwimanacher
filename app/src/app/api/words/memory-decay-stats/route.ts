/**
 * API: Memory Decay Statistics
 * GET /api/words/memory-decay-stats
 *
 * Returns memory level breakdown and decay impact metrics
 * Used for analytics and insights dashboard
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

      // Get memory level distribution
      const { data: memoryDistribution, error: distError } = await supabase
        .from("user_words")
        .select("memory_level", { count: "exact" })
        .eq("user_id", userId);

      if (distError) {
        throw distError;
      }

      // Categorize by memory level
      const stats = {
        veryWeakMemory: 0, // 0-20%
        weakMemory: 0, // 20-40%
        averageMemory: 0, // 40-60%
        strongMemory: 0, // 60-80%
        masteredMemory: 0, // 80-100%
      };

      memoryDistribution?.forEach((word) => {
        const level = word.memory_level ?? 0;
        if (level < 20) stats.veryWeakMemory++;
        else if (level < 40) stats.weakMemory++;
        else if (level < 60) stats.averageMemory++;
        else if (level < 80) stats.strongMemory++;
        else stats.masteredMemory++;
      });

      // Get words that will be decayed soon (not reviewed in 1+ days)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: upcomingDecay, error: decayError } = await supabase
        .from("user_words")
        .select("memory_level", { count: "exact" })
        .eq("user_id", userId)
        .lt("memory_level", 80) // Only non-mastered words
        .or(
          `last_reviewed_at.is.null,last_reviewed_at.lt.${oneDayAgo.toISOString()}`
        );

      if (decayError && decayError.code !== "PGRST116") {
        throw decayError;
      }

      const totalWords = memoryDistribution?.length ?? 0;
      const eligibleForDecay = upcomingDecay?.length ?? 0;

      return NextResponse.json({
        memoryLevelDistribution: {
          veryWeak: {
            count: stats.veryWeakMemory,
            percentage:
              totalWords > 0
                ? Math.round((stats.veryWeakMemory / totalWords) * 100)
                : 0,
            label: "0-20%",
          },
          weak: {
            count: stats.weakMemory,
            percentage:
              totalWords > 0
                ? Math.round((stats.weakMemory / totalWords) * 100)
                : 0,
            label: "20-40%",
          },
          average: {
            count: stats.averageMemory,
            percentage:
              totalWords > 0
                ? Math.round((stats.averageMemory / totalWords) * 100)
                : 0,
            label: "40-60%",
          },
          strong: {
            count: stats.strongMemory,
            percentage:
              totalWords > 0
                ? Math.round((stats.strongMemory / totalWords) * 100)
                : 0,
            label: "60-80%",
          },
          mastered: {
            count: stats.masteredMemory,
            percentage:
              totalWords > 0
                ? Math.round((stats.masteredMemory / totalWords) * 100)
                : 0,
            label: "80-100%",
          },
        },
        decayMetrics: {
          totalWords,
          eligibleForDecay,
          masteredWords: stats.masteredMemory,
          decayRate: `${5}% per day`,
          nextDecayRun: "2:00 AM UTC tomorrow",
        },
      });
    } catch (error) {
      console.error("Memory decay stats error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch memory decay statistics",
        },
        { status: 500 }
      );
    }
  }
);

export const GET = handler;
