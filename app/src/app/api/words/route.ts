import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { learningWords } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  // Lấy tất cả từ muốn học, sắp xếp theo thời gian học gần nhất
  const words = await db
    .select()
    .from(learningWords)
    .orderBy(desc(learningWords.added_at));
  return NextResponse.json(words);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.word || typeof data.word !== "string") {
    return NextResponse.json({ error: "Thiếu trường từ mới" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const [result] = await db
    .insert(learningWords)
    .values({
      id: crypto.randomUUID(),
      word: data.word,
      phonetic: data.phonetic || "",
      meaning: data.meaning || "",
      added_at: now,
      study_dates: JSON.stringify([]),
      is_mastered: false,
    })
    .returning();
  return NextResponse.json({ result });
}
