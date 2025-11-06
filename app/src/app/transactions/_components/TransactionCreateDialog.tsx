"use client";
import React from "react";
import AppDialog from "@/components/ui/app-dialog";
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
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Transaction"
      description="Create a new income or expense transaction"
      maxWidth="2xl"
    >
      <TransactionForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        showTypeSelector
      />
    </AppDialog>
  );
}
