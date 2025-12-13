"use client";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  useTheme,
  Chip,
  Tooltip,
} from "@mui/material";
import { CheckCircle2, Trash2, RotateCw } from "lucide-react";
import { formatRecurrence, parseRecurrenceDays } from "@/lib/recurrence-utils";
import { useTodoCategories } from "@/services/react-query/hooks/todos";

interface TodoCardProps {
  id: string;
  description: string;
  time: string; // HH:mm format
  status: "completed" | "not_completed";
  categoryId?: string;
  recurrenceType?: "none" | "daily" | "weekly" | "specific_days";
  recurrenceDays?: string; // JSON array
  onToggleStatus: (id: string, current: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoCard({
  id,
  description,
  time,
  status,
  categoryId,
  recurrenceType = "none",
  recurrenceDays,
  onToggleStatus,
  onDelete,
}: TodoCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isCompleted = status === "completed";
  const { data: categories } = useTodoCategories();

  const category = categories?.find((c) => c.id === categoryId);
  const recurrenceDaysArray = parseRecurrenceDays(recurrenceDays);
  const hasRecurrence = recurrenceType && recurrenceType !== "none";

  return (
    <Box
      sx={{
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderRadius: "12px",
        padding: "12px",
        boxShadow: isDark ? "none" : "0px 1px 2px rgba(0, 0, 0, 0.08)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        opacity: isCompleted ? 0.6 : 1,
        transition: "all 0.2s ease-out",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        justifyContent="space-between"
      >
        {/* Checkbox and Content */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
          <Box
            onClick={() => onToggleStatus(id, status)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: isCompleted
                ? "none"
                : isDark
                ? "2px solid #334155"
                : "2px solid #E5E7EB",
              backgroundColor: isCompleted
                ? isDark
                  ? "#34D399"
                  : "#10B981"
                : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.3s ease-out",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: isCompleted
                  ? isDark
                    ? "#34D399"
                    : "#10B981"
                  : isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#F9FAFB",
              },
            }}
          >
            {isCompleted && (
              <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </Box>

          <Stack flex={1} minWidth={0}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                color: theme.palette.text.primary,
                textDecoration: isCompleted ? "line-through" : "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {description}
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ mt: 0.75 }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  lineHeight: "16px",
                }}
              >
                {time}
              </Typography>

              {category && (
                <Chip
                  label={category.name}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "10px",
                    bgcolor: category.color,
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}

              {hasRecurrence && (
                <Tooltip
                  title={formatRecurrence(recurrenceType, recurrenceDaysArray)}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
                  >
                    <RotateCw
                      size={12}
                      color={
                        theme.palette.mode === "dark" ? "#94A3B8" : "#6B7280"
                      }
                    />
                    <Typography
                      sx={{
                        fontSize: "10px",
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      {recurrenceType === "daily"
                        ? "D"
                        : recurrenceType === "weekly"
                        ? "W"
                        : "C"}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Delete Button */}
        <IconButton
          size="small"
          onClick={() => onDelete(id)}
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F9FAFB",
            },
          }}
        >
          <Trash2 size={16} color={theme.palette.text.secondary} />
        </IconButton>
      </Stack>
    </Box>
  );
}
