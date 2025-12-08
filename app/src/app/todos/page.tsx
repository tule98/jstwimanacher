"use client";
import TodoListInput from "./_components/TodoListInput";
import TodoListTimelineView from "./_components/TodoListTimelineView";
import { Box, Stack } from "@mui/material";

export default function Page() {
  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <TodoListInput />
        <TodoListTimelineView />
      </Stack>
    </Box>
  );
}
