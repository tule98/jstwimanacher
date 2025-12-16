import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";
import { withLogRequest } from "@/lib/route-handlers";

export const GET = withLogRequest(async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeEntries = searchParams.get("includeEntries") !== "false";
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    const month = monthParam ? Number(monthParam) : undefined;
    const year = yearParam ? Number(yearParam) : undefined;

    const data = await databaseService.getHabits(includeEntries, month, year);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
});

export const POST = withLogRequest(async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const habit = await databaseService.createHabit({ name, description });
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
});
