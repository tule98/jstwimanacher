"use client";
import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Divider,
  Alert,
} from "@mui/material";
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useCreateJournalEntry,
} from "@/services/react-query/hooks/habits";
import HabitLogInputWithTagInsertion, {
  type ParsedJournalData,
} from "./_components/HabitLogInputWithTagInsertion";
import HabitCard from "./_components/HabitCard";

export default function HabitsPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [previewData, setPreviewData] = useState<ParsedJournalData | null>(
    null
  );

  const { data: habits, isLoading } = useHabits({
    includeEntries: true,
    days: 30,
  });
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const createJournalEntry = useCreateJournalEntry();

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createHabit.mutateAsync({ name, description });
    setName("");
    setDescription("");
    setOpen(false);
  };

  const toggleStatus = async (id: string, active: boolean) => {
    await updateHabit.mutateAsync({
      id,
      data: { status: active ? "active" : "inactive" },
    });
  };

  const handleSubmitJournal = async () => {
    if (!journalContent.trim() || !previewData) return;

    try {
      // Use the first date mention, or default to today
      const entryDate =
        previewData.dateMentions.length > 0
          ? previewData.dateMentions[0].date
          : new Date().toISOString().slice(0, 10);

      // If there are no habit mentions, we can't save
      if (previewData.habitMentions.length === 0) {
        setSubmitMessage("Please mention at least one habit with @");
        setTimeout(() => setSubmitMessage(""), 3000);
        return;
      }

      // Save journal entry for all mentioned habits
      for (const habitMention of previewData.habitMentions) {
        await createJournalEntry.mutateAsync({
          habitId: habitMention.id,
          content: journalContent,
          entry_date: entryDate,
        });
      }

      setSubmitMessage(
        `Journal saved! Logged ${previewData.habitMentions.length} habit(s) for ${entryDate}`
      );
      setJournalContent("");
      setPreviewData(null);

      // Clear message after 3 seconds
      setTimeout(() => {
        setSubmitMessage("");
      }, 3000);
    } catch (error) {
      setSubmitMessage("Error saving journal entry");
      console.error(error);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Habits
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        New Habit
      </Button>

      {/* Journal Entry Section */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Journal Entry
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Use @ for habits and : for dates (today, tomorrow, yesterday)
        </Typography>
        {!!habits?.length && (
          <Box sx={{ mt: 2 }}>
            <HabitLogInputWithTagInsertion
              habits={habits || []}
              value={journalContent}
              onChange={setJournalContent}
              onPreviewChange={setPreviewData}
              placeholder="Write your journal entry... @ for habits, : for dates"
              showPreview={true}
            />
          </Box>
        )}

        {submitMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {submitMessage}
          </Alert>
        )}

        <Box
          sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            onClick={handleSubmitJournal}
            disabled={!journalContent.trim()}
          >
            Save Journal Entry
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 2,
        }}
      >
        {isLoading && <Typography>Loading...</Typography>}
        {habits?.map((h) => (
          <Box key={h.id}>
            <HabitCard
              habit={h}
              onToggleStatus={toggleStatus}
              onMarkToday={(habitId, date) =>
                createJournalEntry.mutate({
                  habitId,
                  content: "Completed today",
                  entry_date: date,
                })
              }
              onOpenJournal={() => {}}
            />
          </Box>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Habit</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
          />
          <Button sx={{ mt: 2 }} variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
