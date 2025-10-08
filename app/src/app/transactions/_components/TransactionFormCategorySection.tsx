"use client";
import React, { useState } from "react";
import { Category } from "@/services/api/client";
import AppButton from "@/components/ui/app-button";
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {transactionType === "income" ? "Income" : "Expense"} Category
        </label>
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="h-7 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          New Category
        </AppButton>
      </div>

      {categories.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
          No {transactionType === "income" ? "income" : "expense"} categories
          yet. Click &quot;New Category&quot; above to create one.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <AppButton
                key={cat.id}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCategorySelect(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium transition-all duration-200 whitespace-nowrap border-2 ${
                  isSelected
                    ? "border-transparent text-white"
                    : "bg-white dark:bg-gray-800 hover:shadow-sm"
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color : undefined,
                  borderColor: isSelected ? "transparent" : cat.color,
                  color: isSelected ? "#ffffff" : cat.color,
                }}
              >
                {cat.name}
              </AppButton>
            );
          })}
        </div>
      )}

      <CategoryCreateDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        defaultType={transactionType}
      />
    </div>
  );
}
