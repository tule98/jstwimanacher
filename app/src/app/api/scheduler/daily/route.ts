import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { SlackNotificationService } from "@/services/slack/SlackNotificationService";

export async function GET() {
  // TODO: Wire this with Vercel Cron at 06:00 GMT+7
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

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
    ? `Today's tasks:\n${lines.join("\n")}`
    : "No tasks scheduled for today.";
  try {
    await slack.send(text);
  } catch (error) {
    // TODO: log error to monitoring
    console.error("Slack notification failed", error);
  }

  return NextResponse.json({
    sent: true,
    count: todays.length,
  });
}
