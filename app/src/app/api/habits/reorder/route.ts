import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitIds } = body;

    if (!Array.isArray(habitIds) || habitIds.length === 0) {
      return NextResponse.json(
        { error: "habitIds array is required" },
        { status: 400 }
      );
    }

    // Update order for each habit
    const updates = habitIds.map((id, index) =>
      databaseService.updateHabitOrder(id, index)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
