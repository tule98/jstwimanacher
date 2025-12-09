import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// POST /api/habits/completions - Complete a habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitId, completionDate, moodEmoji } = body;

    if (!habitId || typeof habitId !== "string") {
      return NextResponse.json(
        { error: "habitId is required" },
        { status: 400 }
      );
    }

    if (!completionDate || typeof completionDate !== "string") {
      return NextResponse.json(
        { error: "completionDate is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const completion = await databaseService.completeHabit(
      habitId,
      completionDate,
      moodEmoji
    );

    return NextResponse.json(completion);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// GET /api/habits/completions?habitId=xxx&startDate=xxx&endDate=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!habitId) {
      // Get all completions in range
      if (!startDate || !endDate) {
        return NextResponse.json(
          {
            error:
              "startDate and endDate are required when habitId is not provided",
          },
          { status: 400 }
        );
      }
      const completions = await databaseService.getAllCompletionsInRange(
        startDate,
        endDate
      );
      return NextResponse.json(completions);
    }

    // Get completions for specific habit
    const completions = await databaseService.getHabitCompletions(
      habitId,
      startDate || undefined,
      endDate || undefined
    );

    return NextResponse.json(completions);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/completions?habitId=xxx&completionDate=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get("habitId");
    const completionDate = searchParams.get("completionDate");

    if (!habitId || !completionDate) {
      return NextResponse.json(
        { error: "habitId and completionDate are required" },
        { status: 400 }
      );
    }

    const success = await databaseService.uncompleteHabit(
      habitId,
      completionDate
    );

    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
