/**
 * Review History Chart Component
 *
 * Displays bar chart of review activity over time
 * Shows how many words reviewed each day
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";

export default function ReviewHistoryChart() {
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ["review-history"],
    queryFn: async () => {
      const response = await fetch("/api/words/review-history");
      if (!response.ok) throw new Error("Failed to fetch review history");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ height: 300, display: "flex", alignItems: "center" }}>
        <Typography color="textSecondary">Loading review history...</Typography>
      </Box>
    );
  }

  if (!reviewData?.data || reviewData.data.length === 0) {
    return (
      <Box sx={{ height: 300, display: "flex", alignItems: "center" }}>
        <Typography color="textSecondary">
          No review history yet. Start reviewing to see data!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reviewData.data}>
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
          />
          <Legend />
          <Bar
            dataKey="reviewed"
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
            name="Words Reviewed"
            animationDuration={600}
          />
          <Bar
            dataKey="marked_known"
            fill="#10B981"
            radius={[8, 8, 0, 0]}
            name="Marked Known"
            animationDuration={600}
          />
          <Bar
            dataKey="marked_review"
            fill="#F59E0B"
            radius={[8, 8, 0, 0]}
            name="Marked for Review"
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
