"use client";
import { useState } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Switch,
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
  useLogHabit,
  useCreateJournalEntry,
} from "@/services/react-query/hooks/habits";
import HabitLogInputWithTagInsertion from "./_components/HabitLogInputWithTagInsertion";

export default function HabitsPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [submitMessage, setSubmitMessage] = useState("");

  const { data: habits, isLoading } = useHabits({
    includeLogs: true,
    days: 30,
  });
  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const logHabit = useLogHabit();
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

  const handleOpenJournal = (habitId: string) => {
    setSelectedHabitId(habitId);
    setJournalContent("");
    setSubmitMessage("");
    setJournalOpen(true);
  };

  const parseJournalContent = (html: string) => {
    // Parse HTML to extract mentions and dates
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const mentions = doc.querySelectorAll('[data-type="mention"]');
    const text = doc.body.textContent || "";

    // Extract habit IDs from mentions
    const habitIds: string[] = [];
    mentions.forEach((mention) => {
      const id = mention.getAttribute("data-id");
      if (id) habitIds.push(id);
    });

    // Parse dates from text (looking for formats like "today", "2024-01-15", "tomorrow")
    const datePatterns = [
      /\b\d{4}-\d{2}-\d{2}\b/g, // YYYY-MM-DD
      /\btoday\b/gi,
      /\btomorrow\b/gi,
      /\byesterday\b/gi,
    ];

    let entryDate = new Date().toISOString().slice(0, 10); // default to today

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const match = matches[0].toLowerCase();
        if (match === "today") {
          entryDate = new Date().toISOString().slice(0, 10);
        } else if (match === "tomorrow") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          entryDate = tomorrow.toISOString().slice(0, 10);
        } else if (match === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          entryDate = yesterday.toISOString().slice(0, 10);
        } else if (/\d{4}-\d{2}-\d{2}/.test(match)) {
          entryDate = match;
        }
        break;
      }
    }

    return { habitIds, entryDate, text };
  };

  const handleSubmitJournal = async () => {
    if (!journalContent.trim() || !selectedHabitId) return;

    try {
      const { habitIds, entryDate } = parseJournalContent(journalContent);

      // Save journal entry for the selected habit
      await createJournalEntry.mutateAsync({
        habitId: selectedHabitId,
        content: journalContent,
        entry_date: entryDate,
      });

      // Also log habit completions for mentioned habits on the parsed date
      for (const habitId of habitIds) {
        await logHabit.mutateAsync({
          habitId,
          date: entryDate,
          completed: true,
        });
      }

      setSubmitMessage(
        `Journal saved! Logged ${habitIds.length} habit(s) for ${entryDate}`
      );
      setJournalContent("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setJournalOpen(false);
        setSubmitMessage("");
      }, 2000);
    } catch (error) {
      setSubmitMessage("Error saving journal entry");
      console.error(error);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Habits
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        New Habit
      </Button>

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
            <Card>
              <CardContent>
                <Typography variant="h6">{h.name}</Typography>
                {h.description && (
                  <Typography variant="body2" color="text.secondary">
                    {h.description}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Status: {h.status}
                </Typography>
                {/* Simple contribution view: show last 14 days dots */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  {(h.logs ?? [])
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(-14)
                    .map((log) => (
                      <div
                        key={log.id}
                        title={`${log.date} - ${
                          log.completed ? "Done" : "Missed"
                        }`}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 2,
                          backgroundColor: log.completed
                            ? "#2e7d32"
                            : "#c8e6c9",
                        }}
                      />
                    ))}
                </div>
              </CardContent>
              <CardActions>
                <Switch
                  checked={h.status === "active"}
                  onChange={(e) => toggleStatus(h.id, e.target.checked)}
                />
                <Button
                  size="small"
                  onClick={() =>
                    logHabit.mutate({
                      habitId: h.id,
                      date: today,
                      completed: true,
                    })
                  }
                >
                  Mark Today
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenJournal(h.id)}
                >
                  Journal
                </Button>
              </CardActions>
            </Card>
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

      <Dialog
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Habit Journal - {habits?.find((h) => h.id === selectedHabitId)?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Type @ to mention a habit. Mention dates like &ldquo;today&rdquo;,
            &ldquo;tomorrow&rdquo;, &ldquo;2024-11-26&rdquo; to set the entry
            date.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <HabitLogInputWithTagInsertion
              habits={habits || []}
              value={journalContent}
              onChange={setJournalContent}
              placeholder="Write your journal entry... Mention habits with @ and dates"
            />
          </Box>

          {submitMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {submitMessage}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button onClick={() => setJournalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitJournal}
              disabled={!journalContent.trim()}
            >
              Save Journal Entry
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
