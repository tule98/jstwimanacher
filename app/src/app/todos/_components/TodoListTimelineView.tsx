"use client";
import { Box, Typography, useTheme } from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import {
  useTodosList,
  useUpdateTodo,
  useDeleteTodo,
} from "@/services/react-query/hooks/todos";
import { toUTC, fromUTC, VN_TIMEZONE } from "@/lib/timezone";
import TodoCard from "./TodoCard";

interface TodoListTimelineViewProps {
  onToggleStatus?: (id: string, current: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

function getTwoMonthRangeISO() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twoMonthsLater = new Date(
    now.getFullYear(),
    now.getMonth() + 2,
    now.getDate()
  );
  // Convert to UTC for API query
  const start = toUTC(todayStart, VN_TIMEZONE);
  const end = toUTC(twoMonthsLater, VN_TIMEZONE);
  return { start, end, now };
}

export default function TodoListTimelineView({
  onToggleStatus: propToggleStatus,
  onDelete: propDelete,
}: TodoListTimelineViewProps) {
  const { start, end, now } = getTwoMonthRangeISO();
  const { data: allData } = useTodosList(start as string, end as string);
  const theme = useTheme();
  const { mutateAsync: updateTodo } = useUpdateTodo();
  const { mutateAsync: deleteTodo } = useDeleteTodo();

  // Limit to 30 items maximum
  const data = (allData ?? []).slice(0, 30);

  // Use provided handlers or fallback to mutations
  const handleToggleStatus = propToggleStatus
    ? propToggleStatus
    : async (id: string, current: string) => {
        const next = current === "completed" ? "not_completed" : "completed";
        await updateTodo({ id, payload: { status: next } });
      };

  const handleDelete = propDelete
    ? propDelete
    : async (id: string) => {
        await deleteTodo(id);
      };

  const tasks = (data ?? []).map((t) => ({
    ...t,
    time: fromUTC(t.due_date as string, VN_TIMEZONE), // Convert from UTC to local time for display
  }));

  // Group tasks by day for the 2-week view
  const tasksByDay: Map<string, typeof tasks> = new Map();
  tasks.forEach((t) => {
    const dayKey = t.time.toLocaleDateString("en-CA"); // YYYY-MM-DD format
    if (!tasksByDay.has(dayKey)) {
      tasksByDay.set(dayKey, []);
    }
    tasksByDay.get(dayKey)!.push(t);
  });

  // Generate array of days for the 2-month view
  const days: Date[] = [];
  for (let i = 0; i < 60; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    days.push(day);
  }

  function getDayTasksWithTimeline(dayDate: Date) {
    const dayKey = dayDate.toLocaleDateString("en-CA");
    const dayTasks = tasksByDay.get(dayKey) ?? [];
    const dayStart = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate()
    );
    const dayEnd = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate() + 1
    );
    const totalMs = dayEnd.getTime() - dayStart.getTime();

    return {
      dayKey,
      dayTasks,
      dayStart,
      totalMs,
      pctFor: (date: Date) => {
        const ms = date.getTime() - dayStart.getTime();
        return Math.min(100, Math.max(0, (ms / totalMs) * 100));
      },
      isToday: dayDate.toLocaleDateString() === now.toLocaleDateString(),
    };
  }

  return (
    <Box>
      <Timeline
        sx={{
          padding: 0,
          margin: 0,
          "& .MuiTimelineItem-root": {
            "&:before": {
              display: "none", // Remove default left spacing
            },
          },
        }}
      >
        {days
          .map((dayDate) => {
            const { dayKey, dayTasks, isToday } =
              getDayTasksWithTimeline(dayDate);
            const dayLabel = dayDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return {
              dayKey,
              dayDate,
              dayTasks,
              isToday,
              dayLabel,
            };
          })
          .filter((day) => day.dayTasks.length > 0) // Hide days without todos
          .map((day, index, array) => (
            <TimelineItem key={day.dayKey}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: day.isToday
                      ? theme.palette.mode === "dark"
                        ? "#5B7AFF"
                        : "#4158D0"
                      : theme.palette.mode === "dark"
                      ? "#334155"
                      : "#E5E7EB",
                    boxShadow: "none",
                    border: day.isToday
                      ? `2px solid ${
                          theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0"
                        }`
                      : "none",
                    width: 12,
                    height: 12,
                    margin: "6px 0",
                  }}
                />
                {index < array.length - 1 && (
                  <TimelineConnector
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                      width: "2px",
                    }}
                  />
                )}
              </TimelineSeparator>
              <TimelineContent sx={{ paddingRight: 0 }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    mb: 1,
                    color: day.isToday
                      ? theme.palette.mode === "dark"
                        ? "#5B7AFF"
                        : "#4158D0"
                      : theme.palette.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {day.dayLabel}
                  {day.isToday && " • TODAY"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {day.dayTasks.map((t) => (
                    <TodoCard
                      key={t.id}
                      id={t.id}
                      description={t.description}
                      time={t.time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      status={t.status as "completed" | "not_completed"}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                    />
                  ))}
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
      </Timeline>
    </Box>
  );
}
