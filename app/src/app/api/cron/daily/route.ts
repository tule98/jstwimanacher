import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { SlackNotificationService } from "@/services/slack/SlackNotificationService";
import { VN_TIMEZONE } from "@/lib/timezone";

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

  // Get date range for next 2 weeks in GMT+7
  const now = new Date();
  const vietnamTime = new Date(
    now.toLocaleString("en-US", { timeZone: VN_TIMEZONE })
  );

  const start = new Date(vietnamTime);
  start.setHours(0, 0, 0, 0);

  const end = new Date(vietnamTime);
  end.setDate(end.getDate() + 14); // 2 weeks ahead
  end.setHours(23, 59, 59, 999);

  try {
    const rows = await db.select().from(todos);

    // Filter tasks within the 2-week range
    const upcomingTasks = rows.filter((r) => {
      const d = new Date(r.due_date);
      return d >= start && d <= end;
    });

    // Group tasks by day
    const tasksByDay = new Map<string, typeof upcomingTasks>();
    upcomingTasks.forEach((task) => {
      const d = new Date(task.due_date);
      const dayKey = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
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
      const dayDate = new Date(dayKey);
      const dayLabel = dayDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      taskLines.push(`*${dayLabel}*`);
      tasks.forEach((t) => {
        const time = new Date(t.due_date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const statusEmoji = t.status === "completed" ? "✅" : "📌";
        taskLines.push(`  ${statusEmoji} ${t.description} — ${time}`);
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
