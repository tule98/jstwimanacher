"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PieChart from "./_components/PieChart";
import BarChart from "./_components/BarChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  DollarSign,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import API, {
  Category,
  CategoryStats,
  MonthlyStats,
  BalanceStats,
} from "@/services/api/client";

export default function StatsPage() {
  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // getMonth() trả về 0-11
  const [year, setYear] = useState(currentDate.getFullYear());
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");
  const [statsType, setStatsType] = useState<"expense" | "income" | "all">(
    "all"
  ); // New state for stats type

  // Query categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: API.categories.getAll,
  });

  // Query balance stats for current month (includes income + expense + balance)
  const {
    data: balanceStats,
    isLoading: isLoadingBalance,
    isError: isErrorBalance,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery<BalanceStats>({
    queryKey: ["balance-stats", month, year],
    queryFn: () => API.stats.getBalanceStats(month, year),
  });

  // Query stats for current month (for backward compatibility)
  const {
    data: stats = [],
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery<CategoryStats[]>({
    queryKey: ["stats", month, year],
    queryFn: () => API.stats.getCategoryStats(month, year),
  });

  // Query historical stats (last 6 months)
  const {
    data: historicalStats = [],
    isLoading: isLoadingHistorical,
    isError: isErrorHistorical,
    error: historicalError,
  } = useQuery<MonthlyStats[]>({
    queryKey: ["historical-stats", 6],
    queryFn: () => API.stats.getHistoricalStats(6),
  });

  // Tính tổng chi tiêu (sử dụng balanceStats nếu có, fallback về stats)
  const totalExpense =
    balanceStats?.balance || stats.reduce((sum, stat) => sum + stat.total, 0);
  const totalIncome = balanceStats?.income || 0;
  const netBalance = balanceStats?.balance || totalIncome - totalExpense;

  // Prepare data for category charts based on statsType
  const getStatsData = (): CategoryStats[] => {
    if (!balanceStats) return stats;

    return stats;
    // switch (statsType) {
    // case "income":
    //   return balanceStats.income_by_category;
    // case "expense":
    //   return balanceStats.expense_by_category;
    // case "all":
    // default:
    //   return [
    //     ...balanceStats.income_by_category,
    //     ...balanceStats.expense_by_category,
    //   ];
    // }
  };

  const currentStats = getStatsData();

  // Xử lý khi chọn tháng/năm khác
  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value, 10));
  };

  const handleYearChange = (value: string) => {
    setYear(parseInt(value, 10));
  };

  // Lấy màu từ danh mục (updated for ID-based)
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "#6B7280"; // Default gray if not found
  };

  // Get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  // Tạo danh sách năm để chọn (năm hiện tại và 5 năm trước)
  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => currentDate.getFullYear() - 5 + i + 1
  );

  // Tạo danh sách tháng để chọn
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`,
  }));

  // Chuẩn bị dữ liệu cho biểu đồ lịch sử
  const historyChartData = historicalStats
    .map((monthData) => ({
      label: `${monthData.month}/${monthData.year}`,
      value: monthData.total,
      color: "#4CAF50",
    }))
    .reverse(); // Đảo ngược để tháng gần nhất ở bên phải

  // Render skeleton loader khi đang tải dữ liệu
  if (isLoadingStats || isLoadingHistorical || isLoadingBalance) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-md" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render lỗi nếu có
  if (isErrorStats || isErrorHistorical || isErrorBalance) {
    return (
      <Card className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={20} />
            Lỗi khi tải dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-400">
            {(
              (isErrorStats
                ? statsError
                : isErrorHistorical
                ? historicalError
                : balanceError) as Error
            )?.message || "Không thể tải dữ liệu thống kê"}
          </p>
          <Button
            onClick={() => {
              refetchStats();
              refetchBalance();
            }}
            variant="outline"
            className="mt-4 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <RefreshCw size={16} className="mr-2" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <Calendar size={20} />
            Bộ lọc thời gian
          </CardTitle>
          <CardDescription>
            Chọn tháng và năm để xem thống kê chi tiêu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tháng
              </span>
              <Select
                value={month.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Năm
              </span>
              <Select value={year.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => {
                refetchStats();
                refetchBalance();
              }}
              className="mt-6 sm:mt-auto"
              variant="default"
            >
              <RefreshCw size={16} className="mr-2" />
              Cập nhật
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-green-100 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <DollarSign size={20} />
            Tổng quan tài chính tháng {month}/{year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thu nhập */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                Thu nhập
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalIncome.toLocaleString()} đ
              </p>
            </div>

            {/* Chi tiêu */}
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                Chi tiêu
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalExpense.toLocaleString()} đ
              </p>
            </div>

            {/* Balance */}
            <div
              className={`text-center p-4 rounded-lg border ${
                netBalance >= 0
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
              }`}
            >
              <h3
                className={`text-sm font-medium mb-1 ${
                  netBalance >= 0
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-orange-700 dark:text-orange-300"
                }`}
              >
                Số dư
              </h3>
              <p
                className={`text-2xl font-bold ${
                  netBalance >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {netBalance >= 0 ? "+" : ""}
                {netBalance.toLocaleString()} đ
              </p>
            </div>
          </div>

          {totalExpense === 0 && totalIncome === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              Không có dữ liệu giao dịch trong tháng này
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <BarChartIcon size={20} />
            Lịch sử chi tiêu
          </CardTitle>
          <CardDescription>Chi tiêu qua các tháng gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          {historyChartData.length > 0 ? (
            <BarChart
              data={historyChartData}
              title="Chi tiêu 6 tháng gần nhất"
              yAxisLabel="VNĐ"
            />
          ) : (
            <div className="flex justify-center items-center h-60 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Không có dữ liệu lịch sử chi tiêu
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
              <PieChartIcon size={20} />
              Theo danh mục
            </CardTitle>

            {stats.length > 0 && (
              <div className="w-auto">
                {/* Removed TabsList from here - will be added inside Tabs component */}
              </div>
            )}
          </div>
          <CardDescription>
            Phân bổ chi tiêu tháng {month}/{year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStats.length === 0 ? (
            <div className="flex justify-center items-center h-60 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Không có dữ liệu{" "}
                {statsType === "income"
                  ? "thu nhập"
                  : statsType === "expense"
                  ? "chi tiêu"
                  : "giao dịch"}{" "}
                trong tháng {month}/{year}
              </p>
            </div>
          ) : (
            <Tabs
              value={chartView}
              onValueChange={(value) => setChartView(value as "pie" | "bar")}
              className="w-full"
            >
              {/* Stats Type Selector */}
              <div className="flex justify-between items-center mb-4">
                <Tabs
                  value={statsType}
                  onValueChange={(value) =>
                    setStatsType(value as "expense" | "income" | "all")
                  }
                  className="w-auto"
                >
                  <TabsList className="grid w-[280px] grid-cols-3">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
                    <TabsTrigger value="income">Thu nhập</TabsTrigger>
                  </TabsList>
                </Tabs>

                <TabsList className="grid w-[160px] grid-cols-2">
                  <TabsTrigger value="pie" className="flex items-center gap-1">
                    <PieChartIcon size={14} />
                    <span className="hidden sm:inline">Hình tròn</span>
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="flex items-center gap-1">
                    <BarChartIcon size={14} />
                    <span className="hidden sm:inline">Thanh ngang</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="space-y-6">
                <TabsContent value="pie" className="mt-0">
                  <PieChart
                    data={currentStats.map((stat) => ({
                      ...stat,
                      category_name: getCategoryName(
                        stat.category_id || stat.category_name
                      ),
                      color: getCategoryColor(
                        stat.category_id || stat.category_name
                      ),
                    }))}
                    title={`Phân bổ ${
                      statsType === "income"
                        ? "thu nhập"
                        : statsType === "expense"
                        ? "chi tiêu"
                        : "giao dịch"
                    } theo danh mục`}
                  />
                </TabsContent>

                <TabsContent value="bar" className="mt-0">
                  <BarChart
                    data={currentStats
                      .sort((a, b) => b.total - a.total)
                      .map((stat) => ({
                        label: getCategoryName(
                          stat.category_id || stat.category_name
                        ),
                        value: stat.total,
                        color: getCategoryColor(
                          stat.category_id || stat.category_name
                        ),
                      }))}
                    title={`${
                      statsType === "income"
                        ? "Thu nhập"
                        : statsType === "expense"
                        ? "Chi tiêu"
                        : "Giao dịch"
                    } theo danh mục`}
                  />
                </TabsContent>

                <div className="grid grid-cols-1 gap-3 mt-4">
                  {currentStats
                    .sort((a, b) => b.total - a.total)
                    .map((stat, index) => {
                      const categoryId = stat.category_id || stat.category_name;
                      const categoryName = getCategoryName(categoryId);
                      const categoryColor = getCategoryColor(categoryId);

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: categoryColor,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: categoryColor,
                              }}
                            />
                            <span className="font-medium dark:text-white">
                              {categoryName}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {stat.percentage.toFixed(1)}%
                            </Badge>
                            {stat.category_name && (
                              <Badge
                                variant="outline"
                                className={`ml-1 ${
                                  stat.category_name === "income"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                }`}
                              >
                                {stat.category_name === "income"
                                  ? "Thu"
                                  : "Chi"}
                              </Badge>
                            )}
                          </div>
                          <div
                            className={`font-bold ${
                              stat.category_name === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {stat.total.toLocaleString()} đ
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
