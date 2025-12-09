import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { SlackNotificationService } from "@/services/slack/SlackNotificationService";
import { VN_TIMEZONE, getTodayBoundsUTC } from "@/lib/timezone";
import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";

/**
 * Daily cron endpoint to list all tasks for the next 2 weeks
 * Triggered by Vercel Cron at 23:00 UTC (06:00 GMT+7)
 *
 * Cron Schedule: "0 23 * * *" (every day at 23:00 UTC)
 * This converts to 06:00 the next day in GMT+7 (Asia/Ho_Chi_Minh)
 */
export async function GET(req: Request) {
  // Verify cron request is from Vercel
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get date range for next 2 weeks in GMT+7 (UTC equivalent)
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
}
