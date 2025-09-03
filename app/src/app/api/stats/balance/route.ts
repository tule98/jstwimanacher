import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

/**
 * API endpoint để lấy thống kê tài chính tổng thể (income + expense + balance)
 * GET /api/stats/balance?month=X&year=Y
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Tháng và năm là bắt buộc" },
        { status: 400 }
      );
    }

    const balanceStats = await databaseService.getMonthlyBalance(
      parseInt(month, 10),
      parseInt(year, 10)
    );

    return NextResponse.json(balanceStats);
  } catch (error) {
    console.error("Error fetching balance stats:", error);
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
