"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import { CalendarPlus } from "lucide-react";
import TodoListTimelineView from "./_components/TodoListTimelineView";
import { useCreateTodo } from "@/services/react-query/hooks/todos";
import { useMobileBottomActions } from "../_components/MobileBottomLayout";

export default function Page() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const { mutateAsync, isPending } = useCreateTodo();
  const { setPlusAction } = useMobileBottomActions();

  useEffect(() => {
    setPlusAction({ label: "New task", onClick: () => setDialogOpen(true) });
    return () => setPlusAction(null);
  }, [setPlusAction]);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    await mutateAsync({
      id: crypto.randomUUID(),
      description,
      due_date: "",
      status: "not_completed",
    });
    setDescription("");
    setDialogOpen(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setDescription("");
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <TodoListTimelineView />

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            bgcolor: isDark ? "#1E293B" : "#FFFFFF",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          Add New Task
        </DialogTitle>
        <DialogContent>
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
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: isDark ? "#0F172A" : "#F9FAFB",
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              height: "32px",
              borderRadius: "10px",
              px: 2,
              color: isDark ? "#5B7AFF" : "#4158D0",
              border: `1px solid ${isDark ? "#334155" : "#E5E7EB"}`,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !description.trim()}
            variant="contained"
            startIcon={<CalendarPlus size={16} />}
            sx={{
              height: "36px",
              borderRadius: "18px",
              px: 2.5,
              bgcolor: isDark ? "#5B7AFF" : "#4158D0",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
              boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)",
              "&:hover": {
                bgcolor: isDark ? "#4c6bef" : "#3547b8",
              },
            }}
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
