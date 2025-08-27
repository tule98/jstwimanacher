"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
} from "chart.js";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PieChartProps {
  data: {
    category_name: string;
    total: number;
    percentage: number;
    color: string;
  }[];
  title?: string;
}

export default function PieChart({
  data,
  title = "Phân bổ chi tiêu",
}: PieChartProps) {
  // Chuẩn bị dữ liệu cho Chart.js
  const chartData = {
    labels: data.map((item) => item.category_name),
    datasets: [
      {
        data: data.map((item) => item.total),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map(() => "#FFFFFF"),
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  // Cấu hình chart
  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 15,
          color: document.documentElement.classList.contains("dark")
            ? "#E5E7EB"
            : "#374151",
        },
      },
      title: {
        display: !!title,
        text: title,
        color: document.documentElement.classList.contains("dark")
          ? "#4ADE80"
          : "#166534",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = data[context.dataIndex];
            return [
              `${item.category_name}`,
              `${item.total.toLocaleString()} đ (${item.percentage.toFixed(
                1
              )}%)`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px] md:h-[350px] relative">
      <Pie data={chartData} options={options} />
    </div>
  );
}
