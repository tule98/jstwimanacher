import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// GET /api/habits/tokens - Get current month's tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default_user";

    const tokens = await databaseService.getCurrentMonthTokens(userId);
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// POST /api/habits/tokens/use - Use a streak freeze token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitId, freezeDate, userId = "default_user" } = body;

    if (!habitId || typeof habitId !== "string") {
      return NextResponse.json(
        { error: "habitId is required" },
        { status: 400 }
      );
    }

    if (!freezeDate || typeof freezeDate !== "string") {
      return NextResponse.json(
        { error: "freezeDate is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const result = await databaseService.useStreakFreezeToken(
      habitId,
      freezeDate,
      userId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
