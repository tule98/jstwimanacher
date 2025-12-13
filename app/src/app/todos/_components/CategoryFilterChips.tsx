"use client";
import React from "react";
import { Box, Chip, Stack, CircularProgress, useTheme } from "@mui/material";
import { useTodoCategories } from "@/services/react-query/hooks/todos";

interface CategoryFilterChipsProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export default function CategoryFilterChips({
  selectedCategories,
  onCategoryToggle,
}: CategoryFilterChipsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data: categories, isLoading } = useTodoCategories();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        p: 1.5,
        overflowX: "auto",
        overflowY: "hidden",
        scrollBehavior: "smooth",
        "&::-webkit-scrollbar": {
          height: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: isDark ? "#1E293B" : "#F9FAFB",
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: isDark ? "#334155" : "#E5E7EB",
          borderRadius: "2px",
          "&:hover": {
            background: isDark ? "#475569" : "#D1D5DB",
          },
        },
      }}
    >
      {categories?.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <Chip
            key={category.id}
            label={category.name}
            onClick={() => onCategoryToggle(category.id)}
            sx={{
              bgcolor: isSelected
                ? category.color
                : isDark
                ? "#1E293B"
                : "#F9FAFB",
              color: isSelected ? "white" : theme.palette.text.primary,
              border: isSelected
                ? `2px solid ${category.color}`
                : `1px solid ${isDark ? "#334155" : "#E5E7EB"}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: isSelected ? 600 : 400,
              flexShrink: 0,
              "&:hover": {
                borderColor: category.color,
                transform: "scale(1.05)",
              },
            }}
            onDelete={undefined}
          />
        );
      })}
    </Stack>
  );
}
