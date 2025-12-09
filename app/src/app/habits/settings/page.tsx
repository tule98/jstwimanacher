"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from "@mui/material";
import { Settings, Archive, Trash2, RefreshCw, Shield } from "lucide-react";
import AppPageLayout from "@/app/_components/AppPageLayout";
import AppPageNav from "@/app/_components/AppPageNav";
import {
  useArchivedHabits,
  useUnarchiveHabit,
  useDeleteHabit,
  useStreakTokens,
} from "@/services/react-query/hooks/habits";

export default function HabitsSettingsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const { data: archivedHabits = [], isLoading } = useArchivedHabits();
  const { data: tokens } = useStreakTokens();
  const unarchiveHabit = useUnarchiveHabit();
  const deleteHabit = useDeleteHabit();

  const handleUnarchive = async (id: string) => {
    await unarchiveHabit.mutateAsync(id);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedHabitId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHabitId) return;
    await deleteHabit.mutateAsync(selectedHabitId);
    setDeleteConfirmOpen(false);
    setSelectedHabitId(null);
  };

  const selectedHabit = archivedHabits.find((h) => h.id === selectedHabitId);

  return (
    <AppPageLayout
      header={
        <AppPageNav
          title="Settings"
          icon={<Settings size={24} color={isDark ? "#94A3B8" : "#6B7280"} />}
        />
      }
    >
      <Box sx={{ padding: "16px", paddingBottom: "80px" }}>
        {/* Token Balance Card */}
        {tokens && (
          <Box
            sx={{
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: "12px",
              }}
            >
              <Shield size={24} color={isDark ? "#5B7AFF" : "#4158D0"} />
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Streak Freeze Tokens
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1,
                marginBottom: "8px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: isDark ? "#5B7AFF" : "#4158D0",
                  lineHeight: 1,
                }}
              >
                {tokens.total_tokens - tokens.used_tokens}
              </Typography>
              <Typography
                sx={{
                  fontSize: "24px",
                  color: theme.palette.text.secondary,
                }}
              >
                / {tokens.total_tokens}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: "14px",
                color: theme.palette.text.secondary,
              }}
            >
              Available this month • Resets on the 1st
            </Typography>
          </Box>
        )}

        {/* Archived Habits Section */}
        <Box
          sx={{
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginBottom: "16px",
            }}
          >
            <Archive size={24} color={isDark ? "#94A3B8" : "#6B7280"} />
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Archived Habits
            </Typography>
          </Box>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {!isLoading && archivedHabits.length === 0 && (
            <Box sx={{ textAlign: "center", padding: "24px 0" }}>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.palette.text.secondary,
                }}
              >
                No archived habits
              </Typography>
            </Box>
          )}

          {!isLoading && archivedHabits.length > 0 && (
            <List sx={{ padding: 0 }}>
              {archivedHabits.map((habit, index) => (
                <ListItem
                  key={habit.id}
                  sx={{
                    padding: "12px 0",
                    borderTop:
                      index > 0
                        ? `1px solid ${isDark ? "#334155" : "#E5E7EB"}`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ListItemText
                    primary={habit.name}
                    secondary={habit.description || undefined}
                    primaryTypographyProps={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    }}
                    secondaryTypographyProps={{
                      fontSize: "14px",
                      color: theme.palette.text.secondary,
                    }}
                  />

                  <IconButton
                    onClick={() => handleUnarchive(habit.id)}
                    sx={{
                      width: 40,
                      height: 40,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F9FAFB",
                      },
                    }}
                    title="Restore"
                  >
                    <RefreshCw size={20} color="#10B981" />
                  </IconButton>

                  <IconButton
                    onClick={() => handleDeleteClick(habit.id)}
                    sx={{
                      width: 40,
                      height: 40,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(239, 68, 68, 0.1)"
                          : "#FEE2E2",
                      },
                    }}
                    title="Delete permanently"
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
            maxWidth: "400px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          Delete habit permanently?
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{ color: theme.palette.text.secondary, fontSize: "14px" }}
          >
            Are you sure you want to delete &quot;{selectedHabit?.name}&quot;?
            This action cannot be undone and all completion history will be
            lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px" }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 600,
              color: theme.palette.text.secondary,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 600,
              backgroundColor: isDark ? "#F87171" : "#EF4444",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: isDark ? "#EF4444" : "#DC2626",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageLayout>
  );
}
