"use client";
import { useState } from "react";
import {
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
import AppNav from "@/app/_components/AppNav";
import AppPageLayout from "@/app/_components/AppPageLayout";
import AppPageNav from "../_components/AppPageNav";
import { CheckSquare } from "lucide-react";

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
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
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
    if (!journalContent.trim() || !previewData || previewData.length === 0)
      return;

    try {
      // Save all entries from the parsed data
      for (const entry of previewData) {
        await createJournalEntry.mutateAsync({
          habitId: entry.habit.id,
          content: entry.content,
          entry_date: entry.date,
        });
      }

      // Get unique habits and dates for the success message
      const uniqueHabits = new Set(previewData.map((e) => e.habit.name));
      const uniqueDates = new Set(previewData.map((e) => e.date));

      setSubmitMessage(
        `Journal saved! ${previewData.length} entr${
          previewData.length === 1 ? "y" : "ies"
        } for ${uniqueHabits.size} habit(s) across ${uniqueDates.size} date(s)`
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
    <AppPageLayout
      header={<AppPageNav title="Habits" icon={<CheckSquare />} />}
    >
      <Box sx={{ py: 3 }}>
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
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
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
      </Box>
    </AppPageLayout>
  );
}
