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

interface Category {
  name: string;
  color: string;
}

interface Transaction {
  amount: number;
  category_name: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

interface CategoryStat {
  category_name: string;
  total: number;
  percentage: number;
}

interface MonthlyStats {
  month: number;
  year: number;
  total: number;
  stats: CategoryStat[];
}

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

const fetchStatsByMonth = async (
  month: number,
  year: number
): Promise<CategoryStat[]> => {
  const response = await fetch(`/api/stats?month=${month}&year=${year}`);
  if (!response.ok) {
    throw new Error("Failed to fetch statistics");
  }
  return response.json();
};

const fetchHistoricalStats = async (
  months: number
): Promise<MonthlyStats[]> => {
  const response = await fetch(`/api/stats?months=${months}`);
  if (!response.ok) {
    throw new Error("Failed to fetch historical statistics");
  }
  return response.json();
};

export default function StatsPage() {
  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // getMonth() trả về 0-11
  const [year, setYear] = useState(currentDate.getFullYear());
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");

  // Query categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Query stats for current month
  const {
    data: stats = [],
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery<CategoryStat[]>({
    queryKey: ["stats", month, year],
    queryFn: () => fetchStatsByMonth(month, year),
  });

  // Query historical stats (last 6 months)
  const {
    data: historicalStats = [],
    isLoading: isLoadingHistorical,
    isError: isErrorHistorical,
    error: historicalError,
  } = useQuery<MonthlyStats[]>({
    queryKey: ["historical-stats", 6],
    queryFn: () => fetchHistoricalStats(6),
  });

  // Tính tổng chi tiêu
  const totalExpense = stats.reduce((sum, stat) => sum + stat.total, 0);

  // Xử lý khi chọn tháng/năm khác
  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value, 10));
  };

  const handleYearChange = (value: string) => {
    setYear(parseInt(value, 10));
  };

  // Lấy màu từ danh mục
  const getCategoryColor = (name: string): string => {
    const category = categories.find((cat) => cat.name === name);
    return category?.color || "#6B7280"; // Default gray if not found
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
  if (isLoadingStats || isLoadingHistorical) {
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
  if (isErrorStats || isErrorHistorical) {
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
            {((isErrorStats ? statsError : historicalError) as Error)
              ?.message || "Không thể tải dữ liệu thống kê"}
          </p>
          <Button
            onClick={() => refetchStats()}
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
              onClick={() => refetchStats()}
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
            Tổng chi tháng {month}/{year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary dark:text-green-400">
            {totalExpense.toLocaleString()} đ
          </p>
          {stats.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Không có dữ liệu chi tiêu trong tháng này
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
          {stats.length === 0 ? (
            <div className="flex justify-center items-center h-60 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Không có dữ liệu chi tiêu trong tháng {month}/{year}
              </p>
            </div>
          ) : (
            <Tabs
              value={chartView}
              onValueChange={(value) => setChartView(value as "pie" | "bar")}
              className="w-full"
            >
              <div className="flex justify-end mb-4">
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
                    data={stats.map((stat) => ({
                      ...stat,
                      color: getCategoryColor(stat.category_name),
                    }))}
                    title="Phân bổ chi tiêu theo danh mục"
                  />
                </TabsContent>

                <TabsContent value="bar" className="mt-0">
                  <BarChart
                    data={stats
                      .sort((a, b) => b.total - a.total)
                      .map((stat) => ({
                        label: stat.category_name,
                        value: stat.total,
                        color: getCategoryColor(stat.category_name),
                      }))}
                    title="Chi tiêu theo danh mục"
                  />
                </TabsContent>

                <div className="grid grid-cols-1 gap-3 mt-4">
                  {stats
                    .sort((a, b) => b.total - a.total)
                    .map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                        style={{
                          borderLeftWidth: "4px",
                          borderLeftColor: getCategoryColor(stat.category_name),
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getCategoryColor(
                                stat.category_name
                              ),
                            }}
                          />
                          <span className="font-medium dark:text-white">
                            {stat.category_name}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {stat.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="font-bold text-primary dark:text-green-400">
                          {stat.total.toLocaleString()} đ
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
