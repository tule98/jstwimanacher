"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TransactionForm from "./TransactionForm";
import { TransactionCreateData } from "@/services/api/client";

interface TransactionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransactionCreateData) => void;
}

export default function TransactionCreateDialog({
  open,
  onOpenChange,
  onSubmit,
}: TransactionCreateDialogProps) {
  const handleSubmit = (data: TransactionCreateData) => {
    // Don't close dialog after submit; let the form reset and continue adding
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[100vh] p-0 flex flex-col overflow-hidden gap-0">
        <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b px-6 py-4">
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Create a new income or expense transaction
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-0">
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            showTypeSelector
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
