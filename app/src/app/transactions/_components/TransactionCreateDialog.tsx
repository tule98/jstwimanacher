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
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Create a new income or expense transaction
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          showTypeSelector
        />
      </DialogContent>
    </Dialog>
  );
}
