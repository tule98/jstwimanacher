import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storySessions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  // Get all story sessions, ordered by creation time descending
  const sessions = await db
    .select()
    .from(storySessions)
    .orderBy(desc(storySessions.created_at));
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Validate input
  if (!data.words || !Array.isArray(data.words) || data.words.length === 0) {
    return NextResponse.json(
      { error: "Phải chọn ít nhất một từ" },
      { status: 400 }
    );
  }

  if (
    !data.story_text ||
    typeof data.story_text !== "string" ||
    data.story_text.trim() === ""
  ) {
    return NextResponse.json(
      { error: "Nội dung truyện không được để trống" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const sessionData = {
    id: crypto.randomUUID(),
    words: JSON.stringify(data.words),
    story_text: data.story_text,
    created_at: now,
    submitted_at: data.status === "submitted" ? now : null,
    status: data.status || "draft",
  };

  const [result] = await db
    .insert(storySessions)
    .values(sessionData)
    .returning();

  return NextResponse.json({ result });
}
