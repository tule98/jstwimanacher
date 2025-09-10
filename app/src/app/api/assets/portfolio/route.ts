import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

// GET /api/assets/portfolio - Lấy portfolio tài sản
export async function GET() {
  try {
    const portfolio = await databaseService.getAssetPortfolio();
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error fetching asset portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset portfolio" },
      { status: 500 }
    );
  }
}
