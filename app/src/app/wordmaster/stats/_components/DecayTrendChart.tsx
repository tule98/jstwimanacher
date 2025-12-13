/**
 * Decay Trend Chart Component
 *
 * Displays line chart of daily decay trend
 * Shows how many words decayed each day (last 7 days)
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@mui/material";

interface DecayTrendChartProps {
  data: Array<{
    date: string;
    words_decayed: number;
  }>;
}

export default function DecayTrendChart({ data }: DecayTrendChartProps) {
  // Format data for chart
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      words_decayed: item.words_decayed,
    }));

  return (
    <Box sx={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="rgba(0,0,0,0.5)"
            style={{ fontSize: 12 }}
          />
          <YAxis stroke="rgba(0,0,0,0.5)" style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value} words`, "Decayed"]}
          />
          <Line
            type="monotone"
            dataKey="words_decayed"
            stroke="#EF4444"
            dot={{ fill: "#EF4444", r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            animationDuration={600}
            isAnimationActive={true}
            name="Words Decayed"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
