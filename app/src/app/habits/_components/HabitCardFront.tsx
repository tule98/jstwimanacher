import React, { useMemo } from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { Check, Flame, GripVertical, Pencil, Trash } from "lucide-react";
import { HabitCompletion } from "@/services/api/habits";
import { formatDate } from "@/lib/habit-utils";
import { useUserTimezone } from "@/hooks/useUserTimezone";
import { formatDateForDisplay } from "@/lib/timezone";

export interface HabitCardFrontProps {
  habitId: string;
  name: string;
  description?: string;
  currentStreak: number;
  isCompleted: boolean;
  moodEmoji?: string;
  frequencyType: "daily" | "custom";
  frequencyDays?: number[];
  completions?: HabitCompletion[];
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete: () => void;
  onUncomplete?: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export default function HabitCardFront({
  name,
  description,
  currentStreak,
  isCompleted,
  moodEmoji,
  frequencyType,
  frequencyDays,
  completions = [],
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  dragHandleProps,
}: HabitCardFrontProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { timezone } = useUserTimezone();

  // Generate contribution graph data for the last 30 days (latest first)
  // Dates are stored in UTC (GMT+0) and displayed using user's timezone
  const contributionData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 30 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - idx);
      const dateStr = formatDate(d);
      const completed = completions?.some((c) => c.completion_date === dateStr);
      return {
        date: dateStr,
        completed,
      };
    });
  }, [completions]);

  const getFrequencyLabel = () => {
    if (frequencyType === "daily") return "Daily";
    if (frequencyDays && frequencyDays.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return frequencyDays.map((d) => dayNames[d]).join(", ");
    }
    return "Custom";
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {/* Top Row: Checkbox, Name/Stats, Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
        }}
      >
        {/* Drag Handle */}
        {dragHandleProps && (
          <Box
            {...dragHandleProps}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              padding: "2px 6px",
              marginLeft: "-4px",
              borderRadius: "8px",
              transition: "all 0.2s ease-out",
              touchAction: "none", // Enable touch dragging on mobile
              WebkitTouchCallout: "none", // Prevent iOS context menu
              WebkitUserSelect: "none", // Prevent text selection
              userSelect: "none",
              "&:hover": {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              },
              "&:active": {
                cursor: "grabbing",
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.15)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <GripVertical
              size={18}
              color={theme.palette.text.secondary}
              opacity={0.6}
            />
          </Box>
        )}

        {/* Check Circle */}
        <Box
          onClick={(e) => {
            e.stopPropagation();
            if (isCompleted) {
              onUncomplete?.();
            } else {
              onComplete();
            }
          }}
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: isCompleted
              ? "none"
              : isDark
              ? "2px solid #334155"
              : "2px solid #E5E7EB",
            backgroundColor: isCompleted
              ? isDark
                ? "#5B7AFF"
                : "#4158D0"
              : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s ease-out",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          {isCompleted ? (
            moodEmoji ? (
              <Typography sx={{ fontSize: "18px", lineHeight: 1 }}>
                {moodEmoji}
              </Typography>
            ) : (
              <Check size={20} color="white" strokeWidth={2.3} />
            )
          ) : null}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "22px",
              color: theme.palette.text.primary,
              marginBottom: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Streak */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Flame
                size={14}
                color={isDark ? "#FFC247" : "#FFB01D"}
                fill={isDark ? "#FFC247" : "#FFB01D"}
              />
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color:
                    currentStreak > 0
                      ? isDark
                        ? "#FFC247"
                        : "#FFB01D"
                      : theme.palette.text.secondary,
                }}
              >
                {currentStreak}
              </Typography>
            </Box>

            {/* Frequency */}
            <Typography
              sx={{
                flex: 1,
                fontSize: "11px",
                fontWeight: 500,
                color: theme.palette.text.secondary,
                lineHeight: "16px",
              }}
            >
              {getFrequencyLabel()}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {onEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#F9FAFB",
                },
              }}
            >
              <Pencil size={16} color={theme.palette.text.secondary} />
            </IconButton>
          )}

          {onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#F9FAFB",
                },
              }}
            >
              <Trash size={16} color={theme.palette.text.secondary} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Description */}
      {description && (
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            color: theme.palette.text.secondary,
            lineHeight: "16px",
            marginLeft: dragHandleProps ? "52px" : "52px", // Align with name
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Typography>
      )}

      {/* Contribution Graph */}
      <Box
        sx={{
          marginLeft: dragHandleProps ? "52px" : "52px", // Align with name
          marginTop: "4px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "2px",
            flexWrap: "nowrap",
            overflowX: "auto",
            paddingBottom: "2px",
            "&::-webkit-scrollbar": {
              height: "0px",
            },
          }}
        >
          {contributionData.map((day) => (
            <Box
              key={day.date}
              title={`${formatDateForDisplay(day.date, timezone)} — ${
                day.completed ? "Done" : "Missed"
              }`}
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                backgroundColor: day.completed
                  ? isDark
                    ? "#5B7AFF"
                    : "#4158D0"
                  : isDark
                  ? "rgba(255, 255, 255, 0.06)"
                  : "#F3F4F6",
                border: `1px solid ${
                  day.completed
                    ? isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(65, 88, 208, 0.3)"
                    : isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#E5E7EB"
                }`,
                flexShrink: 0,
                transition: "all 0.15s ease-out",
                "&:hover": {
                  transform: "scale(1.4)",
                  zIndex: 1,
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
