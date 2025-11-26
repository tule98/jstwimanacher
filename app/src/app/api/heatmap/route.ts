import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month } = body;

    if (!year || typeof year !== "number") {
      return NextResponse.json(
        { error: "Year is required and must be a number" },
        { status: 400 }
      );
    }

    if (
      month !== undefined &&
      (typeof month !== "number" || month < 1 || month > 12)
    ) {
      return NextResponse.json(
        { error: "Month must be a number between 1 and 12" },
        { status: 400 }
      );
    }

    const heatmapData = await databaseService.getHeatmapData(year, month);

    return NextResponse.json({ heatmapData });
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 }
    );
  }
}
