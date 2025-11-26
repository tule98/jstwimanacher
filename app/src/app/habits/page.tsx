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
import HabitLogInputWithTagInsertion from "@/app/dashboard/habits/_components/HabitLogInputWithTagInsertion";

export default function HabitsPage() {
  const [content, setContent] = useState("");
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
        Habit Journal with Mentions
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Type @ to mention a habit in your journal entry
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Journal Entry
            </Typography>

            {isLoading ? (
              <Typography>Loading habits...</Typography>
            ) : (
              <HabitLogInputWithTagInsertion
                habits={habits || []}
                value={content}
                onChange={handleContentChange}
                placeholder="Type @ to mention a habit in your journal..."
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
                Preview (HTML Output):
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

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => {
                alert("Journal entry saved (UI only demo)");
                console.log("Saving content:", content);
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
            <li>Type @ in the text editor to trigger the mention dropdown</li>
            <li>Use arrow keys (↑↓) to navigate through habits</li>
            <li>Press Enter or click to insert a habit mention</li>
            <li>Continue typing after inserting a mention</li>
            <li>Mentions are highlighted in the editor</li>
            <li>The HTML output shows how mentions are stored</li>
          </ol>
        </Typography>
      </Box>
    </Container>
  );
}
