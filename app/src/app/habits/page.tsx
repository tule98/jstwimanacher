"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { useHabits } from "@/services/react-query/hooks/habits";
import HabitLogInputWithTagInsertion, {
  type ParsedJournalData,
} from "@/app/dashboard/habits/_components/HabitLogInputWithTagInsertion";

export default function HabitsPage() {
  const [content, setContent] = useState("");
  const [previewData, setPreviewData] = useState<ParsedJournalData | null>(
    null
  );
  const { data: habits, isLoading } = useHabits({
    includeLogs: false,
    days: 30,
  });

  const handleContentChange = (html: string) => {
    setContent(html);
    console.log("Content updated:", html);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Habit Journal with Mentions (Demo)
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Type @ to mention a habit, type : to mention a date
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Journal Entry Editor
            </Typography>

            {isLoading ? (
              <Typography>Loading habits...</Typography>
            ) : (
              <HabitLogInputWithTagInsertion
                habits={habits || []}
                value={content}
                onChange={handleContentChange}
                onPreviewChange={setPreviewData}
                placeholder="Write your journal... @ for habits, : for dates"
                showPreview={true}
              />
            )}

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available Habits ({habits?.length || 0}):
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {habits?.map((habit) => (
                  <Box
                    key={habit.id}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      fontSize: "0.875rem",
                    }}
                  >
                    {habit.name}
                  </Box>
                ))}
                {(!habits || habits.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No habits available. Create habits first in the dashboard.
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Raw HTML Output:
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: "auto",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                }}
              >
                {content || "<empty>"}
              </Box>
            </Box>

            {previewData && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Parsed Data Summary:
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: "info.light",
                      borderRadius: 1,
                      fontSize: "0.875rem",
                    }}
                  >
                    <Typography variant="body2">
                      • Habit Mentions: {previewData.habitMentions.length}
                    </Typography>
                    <Typography variant="body2">
                      • Date Mentions: {previewData.dateMentions.length}
                    </Typography>
                    {previewData.dateMentions.length > 0 && (
                      <Typography variant="body2">
                        • Entry Date: {previewData.dateMentions[0].date} (
                        {previewData.dateMentions[0].label})
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            )}

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => {
                alert("Journal entry saved (UI only demo)");
                console.log("Saving content:", content);
                console.log("Parsed data:", previewData);
              }}
            >
              Save Entry (Demo)
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Demo Instructions
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>
              Type @ in the text editor to trigger the habit mention dropdown
            </li>
            <li>
              Type : to trigger the date mention dropdown (today, tomorrow,
              yesterday)
            </li>
            <li>Use arrow keys (↑↓) to navigate through options</li>
            <li>Press Enter or click to insert a mention</li>
            <li>
              Habit mentions appear in{" "}
              <strong style={{ color: "#1976d2" }}>blue</strong>, date mentions
              in <strong style={{ color: "#2e7d32" }}>green</strong>
            </li>
            <li>The preview section shows parsed data that will be saved</li>
            <li>
              Multiple mentions of the same habit/date are tracked separately
            </li>
          </ol>
        </Typography>
      </Box>
    </Container>
  );
}
