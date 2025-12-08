import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { SlackNotificationService } from "@/services/slack/SlackNotificationService";
import { VN_TIMEZONE } from "@/lib/timezone";

/**
 * Daily scheduler endpoint to send Slack notifications for today's todos
 * Triggered by Vercel Cron at 23:00 UTC (06:00 GMT+7)
 * 
 * Cron Schedule: "0 23 * * *" (every day at 23:00 UTC)
 * This converts to 06:00 the next day in GMT+7 (Asia/Ho_Chi_Minh)
 */
export async function GET(req: Request) {
  // Verify cron request is from Vercel
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get today's date in GMT+7
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: VN_TIMEZONE }));
  
  const start = new Date(vietnamTime);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(vietnamTime);
  end.setHours(23, 59, 59, 999);

  try {
    const rows = await db.select().from(todos);
    const todays = rows.filter((r) => {
      const d = new Date(r.due_date);
      return d >= start && d <= end;
    });

    const slack = new SlackNotificationService();

    const lines = todays.map(
      (t) =>
        `• ${t.description} — ${new Date(t.due_date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
    );
    
    const text = lines.length
      ? `🎯 *Today's Tasks (GMT+7)*:\n${lines.join("\n")}`
      : "✅ No tasks scheduled for today.";
    
    await slack.send(text);

    return NextResponse.json({
      success: true,
      sent: true,
      count: todays.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Scheduler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
