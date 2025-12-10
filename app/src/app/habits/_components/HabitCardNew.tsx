import React, { useMemo, useState } from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import {
  Check,
  Flame,
  MoreVertical,
  GripVertical,
  BarChart3,
  ArrowLeft,
  Pencil,
  Trash,
} from "lucide-react";
import { HabitCompletion } from "@/services/api/habits";
import { formatDate } from "@/lib/habit-utils";

export interface HabitCardProps {
  id: string;
  name: string;
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
  onMenu?: () => void;
  isDragging?: boolean;
  dragHandleProps?: { onMouseDown: () => void };
}

export default function HabitCardNew({
  name,
  currentStreak,
  isCompleted,
  moodEmoji,
  frequencyType,
  frequencyDays,
  completions,
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  onMenu,
  isDragging = false,
  dragHandleProps,
}: HabitCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [showActivity, setShowActivity] = useState(false);

  const activityDays = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    return Array.from({ length: 28 }, (_, idx) => {
      const d = new Date(base);
      d.setDate(base.getDate() - (27 - idx));
      const dateStr = formatDate(d);
      const completed = completions?.some((c) => c.completion_date === dateStr);
      return {
        date: dateStr,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        completed,
      };
    });
  }, [completions]);

  const handleTap = () => {
    if (showActivity) return;
    if (isCompleted && onUncomplete) {
      onUncomplete();
    } else if (!isCompleted) {
      onComplete();
    }
  };

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
      onClick={handleTap}
      sx={{
        position: "relative",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderRadius: "12px",
        padding: "12px",
        minHeight: "68px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: showActivity ? "default" : "pointer",
        transition: "all 0.2s ease-out",
        boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        opacity: isDragging ? 0.5 : isCompleted ? 0.7 : 1,
        "&:hover": {
          boxShadow: isDark ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-2px)",
          backgroundColor: isDark ? "#334155" : "#FFFFFF",
        },
        "&:active": {
          transform: "scale(0.98)",
        },
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

      {showActivity ? (
        <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Activity (28d)
            </Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setShowActivity(false);
              }}
              sx={{
                width: 36,
                height: 36,
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ArrowLeft size={18} color={theme.palette.text.secondary} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {activityDays.map((day) => (
              <Box
                key={day.date}
                title={`${day.label} — ${day.completed ? "Done" : "Missed"}`}
                sx={{
                  flex: "0 1 calc(14.28% - 6px)",
                  maxWidth: "calc(14.28% - 6px)",
                  aspectRatio: "1",
                  borderRadius: "6px",
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: day.completed
                    ? "#FFFFFF"
                    : theme.palette.text.secondary,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {new Date(day.date).getDate()}
              </Box>
            ))}
          </Box>
          <Typography
            sx={{
              fontSize: "12px",
              color: theme.palette.text.secondary,
              marginTop: "12px",
            }}
          >
            Tap back to return to the habit card.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Check Circle */}
          <Box
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
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "24px",
                color: theme.palette.text.primary,
                marginBottom: "4px",
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
                  size={16}
                  color={isDark ? "#FFC247" : "#FFB01D"}
                  fill={isDark ? "#FFC247" : "#FFB01D"}
                />
                <Typography
                  sx={{
                    fontSize: "13px",
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
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  lineHeight: "16px",
                }}
              >
                {getFrequencyLabel()}
              </Typography>

              {/* Actions */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActivity((prev) => !prev);
                  }}
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    "&:hover": {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#F9FAFB",
                    },
                  }}
                >
                  <BarChart3 size={18} color={theme.palette.text.secondary} />
                </IconButton>

                {onEdit && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F9FAFB",
                      },
                    }}
                  >
                    <Pencil size={17} color={theme.palette.text.secondary} />
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
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F9FAFB",
                      },
                    }}
                  >
                    <Trash size={17} color={theme.palette.text.secondary} />
                  </IconButton>
                )}

                {onMenu && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenu();
                    }}
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F9FAFB",
                      },
                    }}
                  >
                    <MoreVertical
                      size={20}
                      color={theme.palette.text.secondary}
                    />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
