"use client";
import React, { useState } from "react";
import { Category } from "@/services/api/client";
import { Box, Stack, Typography, Button, Chip } from "@mui/material";
import { Plus } from "lucide-react";
import CategoryCreateDialog from "./CategoryCreateDialog";

interface TransactionFormCategorySectionProps {
  categories: Category[];
  selectedCategoryId?: string;
  transactionType: "income" | "expense";
  onCategorySelect: (categoryId: string) => void;
}

export default function TransactionFormCategorySection({
  categories,
  selectedCategoryId,
  transactionType,
  onCategorySelect,
}: TransactionFormCategorySectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCategoryCreated = (newCategory: Category) => {
    // Auto-select the newly created category
    onCategorySelect(newCategory.id);
    setIsDialogOpen(false);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">
          {transactionType === "income" ? "Income" : "Expense"} Category
        </Typography>
        <Button
          type="button"
          variant="text"
          size="small"
          onClick={() => setIsDialogOpen(true)}
          startIcon={<Plus size={14} />}
          sx={{
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.5,
            minHeight: 28,
          }}
        >
          New Category
        </Button>
      </Stack>

      {categories.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No {transactionType === "income" ? "income" : "expense"} categories
          yet. Click &quot;New Category&quot; above to create one.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => onCategorySelect(cat.id)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  borderWidth: 2,
                  borderColor: cat.color,
                  bgcolor: isSelected ? cat.color : "transparent",
                  color: isSelected ? "#fff" : cat.color,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: isSelected ? cat.color : "transparent",
                    opacity: 0.9,
                    boxShadow: 1,
                  },
                  "& .MuiChip-label": {
                    px: 1.5,
                    py: 0.5,
                  },
                }}
              />
            );
          })}
        </Box>
      )}

      <CategoryCreateDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        defaultType={transactionType}
      />
    </Stack>
  );
}
