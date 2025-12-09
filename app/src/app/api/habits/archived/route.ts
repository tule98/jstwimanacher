import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// GET /api/habits/archived - Get all archived habits
export async function GET() {
  try {
    const habits = await databaseService.getArchivedHabits();
    return NextResponse.json(habits);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
