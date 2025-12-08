"use client";
import { useState } from "react";
import { Box, Stack, TextField, Button, useTheme } from "@mui/material";
import { CalendarPlus } from "lucide-react";
import { useCreateTodo } from "@/services/react-query/hooks/todos";

export default function TodoListInput() {
  const [description, setDescription] = useState("");
  const { mutateAsync, isPending } = useCreateTodo();
  const theme = useTheme();

  async function onSubmit() {
    if (!description.trim()) return;
    // due_date is inferred on the backend from description
    await mutateAsync({
      id: crypto.randomUUID(),
      description,
      due_date: "",
      status: "not_completed",
    });
    setDescription("");
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Add a task"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isPending}
          startIcon={<CalendarPlus size={18} />}
        >
          Add
        </Button>
      </Stack>
    </Box>
  );
}
