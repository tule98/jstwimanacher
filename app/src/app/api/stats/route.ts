import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const months = searchParams.get("months"); // Số tháng để thống kê lịch sử

    // Thống kê theo nhiều tháng (lịch sử chi tiêu)
    if (months) {
      const monthsCount = parseInt(months, 10);
      const currentDate = new Date();
      const results = [];

      // Nếu có month và year, bắt đầu từ tháng/năm chỉ định
      const startMonth = month
        ? parseInt(month, 10)
        : currentDate.getMonth() + 1;
      const startYear = year ? parseInt(year, 10) : currentDate.getFullYear();

      // Lấy dữ liệu của nhiều tháng
      for (let i = 0; i < monthsCount; i++) {
        const targetMonth =
          startMonth - i > 0 ? startMonth - i : 12 + (startMonth - i);
        const targetYear = startMonth - i > 0 ? startYear : startYear - 1;

        const monthStats = await databaseService.getCategoryStats(
          targetMonth,
          targetYear
        );

        // Tính tổng chi tiêu trong tháng
        const totalExpense = monthStats.reduce(
          (sum, stat) => sum + stat.total,
          0
        );

        results.push({
          month: targetMonth,
          year: targetYear,
          total: totalExpense,
          stats: monthStats,
        });
      }

      return NextResponse.json(results);
    }

    // Thống kê của một tháng
    if (!month || !year) {
      return NextResponse.json(
        { error: "Tháng và năm là bắt buộc" },
        { status: 400 }
      );
    }

    const stats = await databaseService.getCategoryStats(
      parseInt(month, 10),
      parseInt(year, 10)
    );

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
