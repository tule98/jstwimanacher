import React from "react";
import { addDays, subDays, format } from "date-fns";
import { Stack, Button } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  currentDate: string; // yyyy-MM-dd format
  onDateChange: (date: string) => void;
}

export default function DateNavigator({
  currentDate,
  onDateChange,
}: DateNavigatorProps) {
  const handlePreviousDay = () => {
    const date = new Date(currentDate);
    const previousDay = subDays(date, 1);
    onDateChange(format(previousDay, "yyyy-MM-dd"));
  };

  const handleToday = () => {
    const today = new Date();
    onDateChange(format(today, "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    const nextDay = addDays(date, 1);
    onDateChange(format(nextDay, "yyyy-MM-dd"));
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button
        type="button"
        variant="outlined"
        size="small"
        onClick={handlePreviousDay}
        startIcon={<ChevronLeft size={14} />}
        sx={{
          fontSize: "0.75rem",
          px: 1.5,
          py: 0.5,
          minHeight: 28,
        }}
      >
        Previous day
      </Button>
      <Button
        type="button"
        variant="outlined"
        size="small"
        onClick={handleToday}
        sx={{
          fontSize: "0.75rem",
          px: 1.5,
          py: 0.5,
          minHeight: 28,
        }}
      >
        Today
      </Button>
      <Button
        type="button"
        variant="outlined"
        size="small"
        onClick={handleNextDay}
        endIcon={<ChevronRight size={14} />}
        sx={{
          fontSize: "0.75rem",
          px: 1.5,
          py: 0.5,
          minHeight: 28,
        }}
      >
        Next day
      </Button>
    </Stack>
  );
}
