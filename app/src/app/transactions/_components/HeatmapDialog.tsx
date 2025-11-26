"use client";
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { X } from "lucide-react";
import { useHeatmapData } from "@/services/react-query/queries";
import HeatmapVisualization from "./HeatmapVisualization";

interface HeatmapDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function HeatmapDialog({ open, onClose }: HeatmapDialogProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = React.useState(currentYear);
  const [viewMode, setViewMode] = React.useState<"month" | "year">("month");
  const [month, setMonth] = React.useState(currentMonth);

  const { data, isLoading, isError, error } = useHeatmapData(
    year,
    viewMode === "month" ? month : undefined
  );

  // Generate year options (current year and 5 years back)
  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Spending Heatmap
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Controls */}
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="View Mode"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "month" | "year")}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </TextField>

            <TextField
              select
              label="Year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              sx={{ minWidth: 120 }}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>

            {viewMode === "month" && (
              <TextField
                select
                label="Month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                sx={{ minWidth: 150 }}
              >
                {monthOptions.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>

          {/* Heatmap */}
          <Box sx={{ minHeight: 300 }}>
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <CircularProgress />
              </Stack>
            ) : isError ? (
              <Typography color="error" align="center">
                {(error as Error)?.message || "Failed to load heatmap data"}
              </Typography>
            ) : data ? (
              <HeatmapVisualization
                year={year}
                month={viewMode === "month" ? month : undefined}
                data={data}
              />
            ) : null}
          </Box>

          {/* Legend */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Less
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
                <Box
                  key={intensity}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    bgcolor:
                      intensity === 0
                        ? "#1a1a1a"
                        : `rgb(${Math.floor(
                            56 * (0.2 + intensity * 0.8)
                          )}, ${Math.floor(
                            142 * (0.2 + intensity * 0.8)
                          )}, ${Math.floor(60 * (0.2 + intensity * 0.8))})`,
                  }}
                />
              ))}
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              More
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
