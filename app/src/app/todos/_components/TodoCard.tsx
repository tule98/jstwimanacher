"use client";
import { Box, Stack, IconButton, Typography, useTheme } from "@mui/material";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

interface TodoCardProps {
  id: string;
  description: string;
  time: string; // HH:mm format
  status: "completed" | "not_completed";
  onToggleStatus: (id: string, current: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoCard({
  id,
  description,
  time,
  status,
  onToggleStatus,
  onDelete,
}: TodoCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isCompleted = status === "completed";

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
            <Typography
              sx={{
                fontSize: "11px",
                fontWeight: 500,
                color: theme.palette.text.secondary,
                lineHeight: "16px",
                mt: 0.5,
              }}
            >
              {time}
            </Typography>
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
