"use client";
import React from "react";
import AppDialog from "@/components/ui/app-dialog";
import TransactionForm from "./TransactionForm";
import {
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
} from "@/services/api/client";

interface TransactionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onUpdate: (data: TransactionUpdateData) => void;
}

export default function TransactionEditDialog({
  open,
  onOpenChange,
  transaction,
  onUpdate,
}: TransactionEditDialogProps) {
  const handleSubmit = (data: TransactionCreateData) => {
    const updateData: TransactionUpdateData = {
      id: transaction.id,
      ...data,
    };
    onUpdate(updateData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Transaction"
      description="Update transaction information"
      maxWidth="lg"
    >
      <TransactionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        editTransaction={transaction}
        showTypeSelector={false} // Don't show type selector in edit mode
      />
    </AppDialog>
  );
}
