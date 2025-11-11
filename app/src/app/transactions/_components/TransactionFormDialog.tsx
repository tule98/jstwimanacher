"use client";
import React from "react";
import AppDialog from "@/components/ui/app-dialog";
import TransactionForm from "./TransactionForm";
import {
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
} from "@/services/api/client";

type TransactionFormDialogProps =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSubmit: (data: TransactionCreateData) => void;
    }
  | {
      mode: "edit";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      transaction: Transaction;
      onUpdate: (data: TransactionUpdateData) => void;
    };

export default function TransactionFormDialog(
  props: TransactionFormDialogProps
) {
  const { mode, open, onOpenChange } = props;

  const handleSubmit = (data: TransactionCreateData) => {
    if (mode === "create") {
      props.onSubmit(data);
    } else {
      const updateData: TransactionUpdateData = {
        id: props.transaction.id,
        ...data,
      };
      props.onUpdate(updateData);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const title = mode === "create" ? "Add New Transaction" : "Edit Transaction";
  const description =
    mode === "create"
      ? "Create a new income or expense transaction"
      : "Update transaction information";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth={mode === "create" ? "2xl" : "lg"}
    >
      <TransactionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        editTransaction={mode === "edit" ? props.transaction : undefined}
        showTypeSelector={mode === "create"}
      />
    </AppDialog>
  );
}
