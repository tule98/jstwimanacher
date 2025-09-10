import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// GET /api/config - Lấy tất cả categories và assets để cấu hình
export async function GET() {
  try {
    const [categories, assets] = await Promise.all([
      databaseService.getCategories(),
      databaseService.getAssets(),
    ]);

    return NextResponse.json({
      categories,
      assets,
    });
  } catch (error) {
    console.error("Error fetching config data:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration data" },
      { status: 500 }
    );
  }
}
