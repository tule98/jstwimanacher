/**
 * Memory Level Chart Component
 *
 * Displays pie chart of memory level distribution
 * Shows 5 categories: Mastered, Strong, Average, Weak, Very Weak
 */

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@mui/material";

interface MemoryLevelChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
}

export default function MemoryLevelChart({ data }: MemoryLevelChartProps) {
  return (
    <Box sx={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => value}
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: 20,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
