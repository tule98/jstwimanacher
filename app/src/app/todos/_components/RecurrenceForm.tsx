"use client";
import React from "react";
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  ToggleButton,
  useTheme,
  Chip,
} from "@mui/material";
import { useTodoCategories } from "@/services/react-query/hooks/todos";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface RecurrenceFormProps {
  recurrenceType: "none" | "daily" | "weekly" | "specific_days";
  recurrenceDays?: number[];
  categoryId?: string;
  onRecurrenceTypeChange: (
    type: "none" | "daily" | "weekly" | "specific_days"
  ) => void;
  onRecurrenceDaysChange: (days: number[]) => void;
  onCategoryChange: (id: string) => void;
}

export default function RecurrenceForm({
  recurrenceType,
  recurrenceDays = [],
  categoryId,
  onRecurrenceTypeChange,
  onRecurrenceDaysChange,
  onCategoryChange,
}: RecurrenceFormProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data: categories } = useTodoCategories();

  const handleDayToggle = (day: number) => {
    onRecurrenceDaysChange(
      recurrenceDays.includes(day)
        ? recurrenceDays.filter((d) => d !== day)
        : [...recurrenceDays, day].sort()
    );
  };

  return (
    <Stack spacing={2}>
      {/* Category Selection */}
      <FormControl fullWidth>
        <FormLabel
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Category
        </FormLabel>
        <Select
          value={categoryId || ""}
          onChange={(e) => onCategoryChange(e.target.value)}
          size="small"
          sx={{
            bgcolor: isDark ? "#0F172A" : "#F9FAFB",
            borderRadius: "10px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        >
          <MenuItem value="">None</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: cat.color,
                  }}
                />
                <Box component="span">{cat.name}</Box>
                {cat.is_default && (
                  <Chip
                    label="Default"
                    size="small"
                    color="primary"
                    sx={{ height: 22 }}
                  />
                )}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Recurrence Type */}
      <FormControl fullWidth>
        <FormLabel
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Repeat
        </FormLabel>
        <Select
          value={recurrenceType}
          onChange={(e) =>
            onRecurrenceTypeChange(
              e.target.value as "none" | "daily" | "weekly" | "specific_days"
            )
          }
          size="small"
          sx={{
            bgcolor: isDark ? "#0F172A" : "#F9FAFB",
            borderRadius: "10px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
        >
          <MenuItem value="none">No repeat</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="specific_days">Specific Days</MenuItem>
        </Select>
      </FormControl>

      {/* Specific Days Selection */}
      {recurrenceType === "specific_days" && (
        <FormControl fullWidth>
          <FormLabel
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Select Days
          </FormLabel>
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
            {DAY_LABELS.map((label, index) => (
              <ToggleButton
                key={index}
                value={index}
                selected={recurrenceDays.includes(index)}
                onChange={() => handleDayToggle(index)}
                sx={{
                  flex: 1,
                  height: 36,
                  fontSize: "12px",
                  fontWeight: 600,
                  border: `1px solid ${isDark ? "#334155" : "#E5E7EB"}`,
                  borderRadius: "8px",
                  color: recurrenceDays.includes(index)
                    ? "white"
                    : theme.palette.text.primary,
                  bgcolor: recurrenceDays.includes(index)
                    ? theme.palette.mode === "dark"
                      ? "#5B7AFF"
                      : "#4158D0"
                    : "transparent",
                  "&:hover": {
                    bgcolor: recurrenceDays.includes(index)
                      ? theme.palette.mode === "dark"
                        ? "#5B7AFF"
                        : "#4158D0"
                      : isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#F9FAFB",
                  },
                }}
              >
                {label}
              </ToggleButton>
            ))}
          </Stack>
        </FormControl>
      )}
    </Stack>
  );
}
