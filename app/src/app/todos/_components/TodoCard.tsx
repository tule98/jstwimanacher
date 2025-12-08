"use client";
import {
  Card,
  CardContent,
  Stack,
  IconButton,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
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
  const isCompleted = status === "completed";

  return (
    <Card
      sx={{
        mb: 1,
        opacity: isCompleted ? 0.7 : 1,
        textDecoration: isCompleted ? "line-through" : "none",
        borderLeft: `4px solid ${
          isCompleted ? theme.palette.success.main : theme.palette.primary.main
        }`,
        bgcolor: isCompleted
          ? theme.palette.action.hover
          : theme.palette.background.paper,
        cursor: "pointer",
      }}
    >
      <CardContent sx={{ pb: 1, pt: 1, "&:last-child": { pb: 1 } }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ flex: 1 }}
          >
            <IconButton
              size="small"
              onClick={() => onToggleStatus(id, status)}
              sx={{ mt: 0.25 }}
            >
              {isCompleted ? (
                <CheckCircle2 size={18} color={theme.palette.success.main} />
              ) : (
                <Circle size={18} />
              )}
            </IconButton>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {description}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                {time}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              size="small"
              label={isCompleted ? "Done" : "Pending"}
              color={isCompleted ? "success" : "default"}
            />
            <IconButton size="small" color="error" onClick={() => onDelete(id)}>
              <Trash2 size={16} />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
