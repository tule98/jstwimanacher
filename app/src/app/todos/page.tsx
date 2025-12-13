"use client";
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  useTheme,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { CalendarPlus, X } from "lucide-react";
import TodoListTimelineView from "./_components/TodoListTimelineView";
import {
  useCreateTodo,
  useDefaultTodoCategory,
} from "@/services/react-query/hooks/todos";
import { useMobileBottomActions } from "../_components/MobileBottomLayout";
import ResponsiveDialog from "@/components/ui/ResponsiveDialog";
import RecurrenceForm from "./_components/RecurrenceForm";

export default function Page() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [userSetCategory, setUserSetCategory] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<
    "none" | "daily" | "weekly" | "specific_days"
  >("none");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const { mutateAsync, isPending } = useCreateTodo();
  const { defaultCategory } = useDefaultTodoCategory();
  const { setPlusAction } = useMobileBottomActions();

  useEffect(() => {
    setPlusAction({ label: "New task", onClick: () => setDialogOpen(true) });
    return () => setPlusAction(null);
  }, [setPlusAction]);

  useEffect(() => {
    if (!dialogOpen) return;
    if (userSetCategory) return;
    if (!categoryId && defaultCategory) {
      setCategoryId(defaultCategory.id);
    }
  }, [dialogOpen, defaultCategory, userSetCategory, categoryId]);

  const handleCategoryChange = (id: string) => {
    setUserSetCategory(true);
    setCategoryId(id);
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    await mutateAsync({
      id: crypto.randomUUID(),
      description,
      due_date: "",
      status: "not_completed",
      category_id: categoryId || undefined,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceDays.length > 0 ? recurrenceDays : undefined,
    });
    setDescription("");
    setCategoryId("");
    setUserSetCategory(false);
    setRecurrenceType("none");
    setRecurrenceDays([]);
    setDialogOpen(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setDescription("");
    setCategoryId("");
    setUserSetCategory(false);
    setRecurrenceType("none");
    setRecurrenceDays([]);
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <TodoListTimelineView />

      <ResponsiveDialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        contentProps={{
          sx: {
            bgcolor: isDark ? "#0F172A" : "#FFFFFF",
            p: 3,
          },
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Add New Task
            </Typography>
            <Box
              onClick={handleClose}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F9FAFB",
                },
              }}
            >
              <X size={20} color={theme.palette.text.secondary} />
            </Box>
          </Stack>

          {/* Form Content */}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            placeholder="Enter task details..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: isDark ? "#1E293B" : "#F9FAFB",
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleSubmit();
              }
            }}
          />

          <RecurrenceForm
            recurrenceType={recurrenceType}
            recurrenceDays={recurrenceDays}
            categoryId={categoryId}
            onRecurrenceTypeChange={setRecurrenceType}
            onRecurrenceDaysChange={setRecurrenceDays}
            onCategoryChange={handleCategoryChange}
          />

          {/* Actions */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderColor: isDark ? "#334155" : "#E5E7EB",
                color: theme.palette.text.primary,
                textTransform: "none",
                borderRadius: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || isPending}
              variant="contained"
              startIcon={<CalendarPlus size={16} />}
              sx={{
                bgcolor: isDark ? "#5B7AFF" : "#4158D0",
                color: "white",
                textTransform: "none",
                borderRadius: "10px",
                "&:hover": {
                  bgcolor: isDark ? "#4158D0" : "#3646B0",
                },
              }}
            >
              {isPending ? "Adding..." : "Add Task"}
            </Button>
          </Stack>
        </Stack>
      </ResponsiveDialog>
    </Box>
  );
}
