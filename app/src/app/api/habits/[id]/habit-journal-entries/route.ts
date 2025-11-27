import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { habitJournalEntries, habits } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 10;

    const entries = await db
      .select()
      .from(habitJournalEntries)
      .where(eq(habitJournalEntries.habit_id, id))
      .orderBy(desc(habitJournalEntries.entry_date))
      .limit(limit);

    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const { content, entry_date } = body;

    if (!content || !entry_date) {
      return NextResponse.json(
        { error: "content and entry_date are required" },
        { status: 400 }
      );
    }

    // Verify habit exists
    const habit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, id))
      .limit(1);

    if (!habit.length) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const entry = await db
      .insert(habitJournalEntries)
      .values({
        id: uuidv4(),
        habit_id: id,
        content,
        entry_date,
        created_at: now,
        updated_at: now,
      })
      .returning();

    return NextResponse.json(entry[0]);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
