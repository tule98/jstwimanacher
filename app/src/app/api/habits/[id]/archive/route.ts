import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// POST /api/habits/[id]/archive - Archive a habit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habit = await databaseService.archiveHabit(params.id);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id]/archive - Unarchive a habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habit = await databaseService.unarchiveHabit(params.id);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
