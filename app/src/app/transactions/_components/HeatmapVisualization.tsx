"use client";
import * as React from "react";
import { Box, Typography, Stack, Tooltip } from "@mui/material";
import { HeatmapDataPoint } from "@/services/api/client";

interface HeatmapVisualizationProps {
  year: number;
  month?: number;
  data: HeatmapDataPoint[];
}

export default function HeatmapVisualization({
  year,
  month,
  data,
}: HeatmapVisualizationProps) {
  // Create a map for quick lookup
  const dataMap = React.useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((point) => {
      map.set(point.date, point.totalSpent);
    });
    return map;
  }, [data]);

  // Get max value for color scaling
  const maxSpent = React.useMemo(() => {
    return Math.max(...data.map((d) => d.totalSpent), 1);
  }, [data]);

  // Generate calendar days
  const calendarDays = React.useMemo(() => {
    const days: Array<{ date: Date; dateStr: string; value: number }> = [];

    if (month !== undefined) {
      // Month view
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1);
      const startOffset = firstDay.getDay(); // 0 = Sunday

      // Add empty cells for offset
      for (let i = 0; i < startOffset; i++) {
        days.push({ date: new Date(0), dateStr: "", value: 0 });
      }

      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dateStr = date.toISOString().split("T")[0];
        const value = dataMap.get(dateStr) || 0;
        days.push({ date, dateStr, value });
      }
    } else {
      // Year view - show all 365/366 days
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        const value = dataMap.get(dateStr) || 0;
        days.push({ date: new Date(d), dateStr, value });
      }
    }

    return days;
  }, [year, month, dataMap]);

  // Get color based on spending amount
  const getColor = (value: number): string => {
    if (value === 0) return "#1a1a1a"; // Very dark for no spending

    // Calculate intensity: 0.2 to 1.0
    const intensity = 0.2 + (value / maxSpent) * 0.8;

    // Use green shades - darker for more spending
    const greenValue = Math.floor(142 * intensity); // Based on primary green #388E3C
    return `rgb(${Math.floor(56 * intensity)}, ${greenValue}, ${Math.floor(
      60 * intensity
    )})`;
  };

  if (month !== undefined) {
    // Month view - weekly grid
    const weeks: (typeof calendarDays)[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 1, justifyContent: "space-around" }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{ width: 40, textAlign: "center", color: "text.secondary" }}
            >
              {day}
            </Typography>
          ))}
        </Stack>

        <Stack spacing={1}>
          {weeks.map((week, weekIdx) => (
            <Stack
              key={weekIdx}
              direction="row"
              spacing={1}
              sx={{ justifyContent: "space-around" }}
            >
              {week.map((day, dayIdx) => (
                <Tooltip
                  key={dayIdx}
                  title={
                    day.dateStr
                      ? `${day.dateStr}: ${day.value.toLocaleString("vi-VN")} ₫`
                      : ""
                  }
                  arrow
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: day.dateStr
                        ? getColor(day.value)
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: day.dateStr ? "pointer" : "default",
                      transition: "transform 0.2s",
                      "&:hover": day.dateStr
                        ? {
                            transform: "scale(1.1)",
                          }
                        : {},
                    }}
                  >
                    {day.dateStr && (
                      <Typography
                        variant="caption"
                        sx={{ color: "white", fontWeight: 600 }}
                      >
                        {day.date.getDate()}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  }

  // Year view - compact grid (52 weeks x 7 days)
  const weeks: (typeof calendarDays)[] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <Box>
      <Stack direction="row" spacing={0.5}>
        {weeks.map((week, weekIdx) => (
          <Stack key={weekIdx} spacing={0.5}>
            {week.map((day, dayIdx) => (
              <Tooltip
                key={dayIdx}
                title={
                  day.dateStr
                    ? `${day.dateStr}: ${day.value.toLocaleString("vi-VN")} ₫`
                    : ""
                }
                arrow
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: day.dateStr ? getColor(day.value) : "transparent",
                    cursor: day.dateStr ? "pointer" : "default",
                    transition: "transform 0.2s",
                    "&:hover": day.dateStr
                      ? {
                          transform: "scale(1.5)",
                        }
                      : {},
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
