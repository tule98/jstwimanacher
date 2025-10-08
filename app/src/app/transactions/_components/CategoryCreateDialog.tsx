"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Category } from "@/services/api/client";
import { useCreateCategory } from "@/services/react-query/mutations";
import { toast } from "sonner";
import CategoryCreateForm from "./CategoryCreateForm";

interface CategoryCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (category: Category) => void;
  defaultType?: "income" | "expense";
}

export default function CategoryCreateDialog({
  isOpen,
  onClose,
  onCategoryCreated,
  defaultType = "expense",
}: CategoryCreateDialogProps) {
  const createCategoryMutation = useCreateCategory();

  const handleSubmit = async (data: {
    name: string;
    color: string;
    type: "income" | "expense";
  }) => {
    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: data.name,
        color: data.color,
        type: data.type,
      });

      toast.success("Category created successfully!", {
        description: data.name,
      });

      if (onCategoryCreated) {
        onCategoryCreated(newCategory);
      }
      onClose();
    } catch (error) {
      toast.error("Failed to create category", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category for your transactions. Choose a name and color
            that helps you identify it easily.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CategoryCreateForm
            defaultType={defaultType}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={createCategoryMutation.isPending}
            submitLabel="Create Category"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
