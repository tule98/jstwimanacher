"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  yAxisLabel?: string;
}

export default function BarChart({
  data,
  title = "Biểu đồ chi tiêu",
  yAxisLabel = "Chi tiêu (VNĐ)",
}: BarChartProps) {
  // Chuẩn bị dữ liệu cho Chart.js
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Chi tiêu",
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color || "#4CAF50"),
        borderColor: data.map((item) =>
          item.color ? adjustColor(item.color, -20) : "#3B8E41"
        ),
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: data.map((item) =>
          item.color ? adjustColor(item.color, 10) : "#5DC66B"
        ),
      },
    ],
  };

  // Cấu hình chart
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          bottom: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `${value.toLocaleString()} đ`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: document.documentElement.classList.contains("dark")
            ? "#9CA3AF"
            : "#6B7280",
        },
        ticks: {
          callback: function (value) {
            if (typeof value === "number") {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + "tr";
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + "k";
              }
              return value;
            }
            return value;
          },
          color: document.documentElement.classList.contains("dark")
            ? "#9CA3AF"
            : "#6B7280",
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9CA3AF"
            : "#6B7280",
        },
        grid: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="w-full h-[250px] md:h-[300px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Hàm hỗ trợ để điều chỉnh màu sắc (làm đậm hoặc nhạt hơn)
function adjustColor(color: string, amount: number): string {
  // Chuyển đổi mã màu hex thành RGB
  let hex = color;
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  // Xử lý các trường hợp độ dài khác nhau của mã màu
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  }

  // Điều chỉnh giá trị RGB
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  // Chuyển đổi lại thành mã màu hex
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}
