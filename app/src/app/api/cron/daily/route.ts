import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { SlackNotificationService } from "@/services/slack/SlackNotificationService";
import { getTodayBoundsUTC, VN_TIMEZONE } from "@/lib/timezone";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Daily cron endpoint to list all tasks for the next 2 weeks
 * Triggered by Vercel Cron at 23:00 UTC (06:00 GMT+7)
 *
 * Cron Schedule: "0 23 * * *" (every day at 23:00 UTC)
 * This converts to 06:00 the next day in GMT+7 (Asia/Ho_Chi_Minh)
 */

const DECAY_RATE_PER_DAY = 8; // 8% per day without review
const MASTERED_THRESHOLD = 100;
const DAYS_UNTIL_DECAY = 1; // Start decay after 1 day

interface UserWord {
  id: string;
  user_id: string;
  word_id: string;
  memory_level: number;
  last_reviewed_at: string | null;
  times_reviewed: number;
}

interface DecayUpdate {
  id: string;
  user_id: string;
  word_id: string;
  newMemoryLevel: number;
  decayAmount: number;
}

async function runDecay() {
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      error: "Missing Supabase configuration",
    };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const now = new Date();
  const decayThresholdDate = new Date(
    now.getTime() - DAYS_UNTIL_DECAY * 24 * 60 * 60 * 1000
  );

  const { data: userWords, error: fetchError } = await supabase
    .from("user_words")
    .select(
      "id, user_id, word_id, memory_level, last_reviewed_at, times_reviewed"
    )
    .lt("memory_level", MASTERED_THRESHOLD)
    .gt("memory_level", 0)
    .or(
      `last_reviewed_at.is.null,last_reviewed_at.lt.${decayThresholdDate.toISOString()}`
    );

  if (fetchError) {
    return {
      success: false,
      error: `Failed to fetch user words: ${fetchError.message}`,
    };
  }

  if (!userWords || userWords.length === 0) {
    return {
      success: true,
      decayedCount: 0,
    };
  }

  const updates = (userWords || [])
    .map((uw: UserWord) => {
      const lastReviewed = uw.last_reviewed_at
        ? new Date(uw.last_reviewed_at)
        : null;
      const nowLocal = new Date();

      let daysSinceReview = 0;
      if (lastReviewed) {
        const diffTime = nowLocal.getTime() - lastReviewed.getTime();
        daysSinceReview = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      } else {
        daysSinceReview = 0;
      }

      if (daysSinceReview < DAYS_UNTIL_DECAY) {
        return null;
      }

      const decayDays = daysSinceReview - DAYS_UNTIL_DECAY;
      const decayPercentage = (decayDays * DECAY_RATE_PER_DAY) / 100;
      const calculatedDecayAmount = uw.memory_level * decayPercentage;
      // Minimum decay is 1 point, even for small percentages
      const decayAmount = Math.max(1, Math.round(calculatedDecayAmount));
      // Minimum memory level after decay is 1 (never goes to 0)
      const roundedNewLevel = Math.max(1, uw.memory_level - decayAmount);

      return {
        id: uw.id,
        user_id: uw.user_id,
        word_id: uw.word_id,
        newMemoryLevel: roundedNewLevel,
        decayAmount,
      };
    })
    .filter((u): u is DecayUpdate => u !== null);

  if (updates.length === 0) {
    return {
      success: true,
      decayedCount: 0,
    };
  }

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

    await supabase.from("review_history").insert({
      user_id: update.user_id,
      word_id: update.word_id,
      user_word_id: update.id,
      action_type: "system_decay",
      memory_before: 0,
      memory_after: 0,
      memory_change: -update.decayAmount,
    });
  }

  const statsDate = now.toISOString().split("T")[0];
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

  const totalDecayAmount =
    Math.round(
      updates.reduce((sum: number, u: DecayUpdate) => sum + u.decayAmount, 0) *
        10
    ) / 10;

  return {
    success: true,
    decayedCount: updates.length,
    totalDecayAmount,
  };
}

export async function GET(req: Request) {
  // Verify cron request is from Vercel
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Run memory decay
    const decayResult = await runDecay();
    if (!decayResult.success) {
      return NextResponse.json(
        { success: false, error: decayResult.error },
        { status: 500 }
      );
    }

    const { start: todayUTC } = getTodayBoundsUTC(VN_TIMEZONE);
    const twoWeeksLaterUTC = new Date(parseISO(todayUTC));
    twoWeeksLaterUTC.setDate(twoWeeksLaterUTC.getDate() + 14);
    const endUTC = twoWeeksLaterUTC.toISOString();

    try {
      const rows = await db.select().from(todos);

      // Filter tasks within the 2-week range (both times are UTC)
      const upcomingTasks = rows.filter((r) => {
        return r.due_date >= todayUTC && r.due_date <= endUTC;
      });

      // Group tasks by day (in Vietnam timezone)
      const tasksByDay = new Map<string, typeof upcomingTasks>();
      upcomingTasks.forEach((task) => {
        const dayKey = formatInTimeZone(
          parseISO(task.due_date),
          VN_TIMEZONE,
          "yyyy-MM-dd"
        );
        if (!tasksByDay.has(dayKey)) {
          tasksByDay.set(dayKey, []);
        }
        tasksByDay.get(dayKey)!.push(task);
      });

      const slack = new SlackNotificationService();

      // Format message with tasks grouped by day
      const taskLines: string[] = [];
      const sortedDays = Array.from(tasksByDay.keys()).sort();

      sortedDays.forEach((dayKey) => {
        const tasks = tasksByDay.get(dayKey) || [];
        const dayDate = parseISO(dayKey);
        const dayLabel = formatInTimeZone(dayDate, VN_TIMEZONE, "EEE, MMM d");

        taskLines.push(`*${dayLabel}*`);
        tasks.forEach((t) => {
          const localTime = formatInTimeZone(
            parseISO(t.due_date),
            VN_TIMEZONE,
            "HH:mm"
          );
          const statusEmoji = t.status === "completed" ? "✅" : "📌";
          taskLines.push(`  ${statusEmoji} ${t.description} — ${localTime}`);
        });
        taskLines.push("");
      });

      const text = taskLines.length
        ? `📋 *Tasks for Next 2 Weeks (GMT+7)*:\n\n${taskLines.join("\n")}`
        : "✅ No tasks scheduled for the next 2 weeks.";

      await slack.send(text);

      return NextResponse.json({
        success: true,
        sent: true,
        count: upcomingTasks.length,
        days: sortedDays.length,
        decayCount: decayResult.decayedCount,
        decayAmount: decayResult.totalDecayAmount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Cron error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Daily cron decay error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const runtime = "edge";
export const dynamic = "force-dynamic";
