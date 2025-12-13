"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@mui/material";
import { Palette, Plus, Star } from "lucide-react";
import {
  useTodoCategories,
  useUpdateTodoCategory,
  useCreateTodoCategory,
} from "@/services/react-query/hooks/todos";

const PRESET_COLORS = [
  "#4158D0", // Primary Blue
  "#FFB01D", // Orange
  "#10B981", // Green
  "#FFB8D1", // Pink
  "#6B7280", // Gray
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
];

export default function TodoCategoriesSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data: categories, isLoading } = useTodoCategories();
  const { mutate: updateCategory } = useUpdateTodoCategory();
  const { mutate: createCategory, isPending: isCreating } =
    useCreateTodoCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#4158D0");
  const [newCategoryDefault, setNewCategoryDefault] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleColorChange = (categoryId: string, color: string) => {
    updateCategory({ id: categoryId, color });
    setEditingId(null);
    setCustomColor("");
  };

  const handleSetDefault = (categoryId: string, isDefault: boolean) => {
    updateCategory({ id: categoryId, is_default: isDefault });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      is_default: newCategoryDefault,
    });
    setNewCategoryName("");
    setNewCategoryColor("#4158D0");
    setNewCategoryDefault(false);
    setCreateDialogOpen(false);
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Task Categories
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                }}
              >
                Customize the colors for your task categories
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                px: 2,
              }}
            >
              New Category
            </Button>
          </Stack>
        </Box>

        {categories?.map((category) => (
          <Box
            key={category.id}
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: isDark ? "#1E293B" : "#F9FAFB",
              border: `1px solid ${isDark ? "#334155" : "#E5E7EB"}`,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: category.color,
                    flexShrink: 0,
                  }}
                />
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {category.name}
                    </Typography>
                    {category.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        color="primary"
                        sx={{ height: 22 }}
                      />
                    )}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {category.color}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {editingId === category.id ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      sx={{ width: 60, "& input": { cursor: "pointer" } }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() =>
                        handleColorChange(category.id, customColor)
                      }
                      sx={{
                        bgcolor:
                          theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                        color: "white",
                        textTransform: "none",
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setEditingId(null)}
                      sx={{
                        borderColor: isDark ? "#334155" : "#E5E7EB",
                        color: theme.palette.text.primary,
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    size="small"
                    startIcon={<Palette size={16} />}
                    onClick={() => {
                      setEditingId(category.id);
                      setCustomColor(category.color);
                    }}
                    sx={{
                      textTransform: "none",
                      color:
                        theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                    }}
                  >
                    Edit
                  </Button>
                )}

                <Button
                  size="small"
                  variant={category.is_default ? "outlined" : "contained"}
                  startIcon={<Star size={16} />}
                  onClick={() =>
                    handleSetDefault(category.id, !category.is_default)
                  }
                  sx={{
                    textTransform: "none",
                    bgcolor: category.is_default
                      ? "transparent"
                      : theme.palette.mode === "dark"
                      ? "#5B7AFF"
                      : "#4158D0",
                    color: category.is_default
                      ? theme.palette.text.primary
                      : "white",
                    borderColor: isDark ? "#334155" : "#E5E7EB",
                    "&:hover": {
                      bgcolor: category.is_default
                        ? isDark
                          ? "rgba(255, 255, 255, 0.05)"
                          : "#F9FAFB"
                        : theme.palette.mode === "dark"
                        ? "#4158D0"
                        : "#3646B0",
                    },
                  }}
                >
                  {category.is_default ? "Unset default" : "Set default"}
                </Button>
              </Stack>
            </Stack>

            {editingId === category.id && (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {PRESET_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setCustomColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border:
                        customColor === color
                          ? `3px solid ${isDark ? "#F1F5F9" : "#111827"}`
                          : "none",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        ))}
      </Stack>

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#0F172A" : "#FFFFFF",
            borderRadius: "12px",
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
          Create New Category
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: "300px" }}>
            <TextField
              autoFocus
              fullWidth
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: isDark ? "#1E293B" : "#F9FAFB",
                },
              }}
            />

            <FormControl fullWidth>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1,
                }}
              >
                Select Color
              </Typography>
              <Stack direction="row" spacing={1}>
                {PRESET_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border:
                        newCategoryColor === color
                          ? `3px solid ${isDark ? "#F1F5F9" : "#111827"}`
                          : "none",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </FormControl>

            <TextField
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              sx={{
                width: "100%",
                height: 40,
                "& input": { cursor: "pointer", height: "100%" },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={newCategoryDefault}
                  onChange={(e) => setNewCategoryDefault(e.target.checked)}
                />
              }
              label="Set as default category"
              sx={{ color: theme.palette.text.primary }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim() || isCreating}
            variant="contained"
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
              color: "white",
            }}
          >
            {isCreating ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
