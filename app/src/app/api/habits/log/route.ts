import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { habitId, date, completed } = body as {
      habitId: string;
      date: string; // YYYY-MM-DD
      completed?: boolean;
    };

    if (!habitId || !date) {
      return NextResponse.json(
        { error: "habitId and date are required" },
        { status: 400 }
      );
    }

    const log = await databaseService.logHabitCompletion(
      habitId,
      date,
      completed ?? true
    );
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
