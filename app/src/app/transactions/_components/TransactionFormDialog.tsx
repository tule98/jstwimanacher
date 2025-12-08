"use client";
import React from "react";
import { Button } from "@mui/material";
import { Plus, X, Save } from "lucide-react";
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
  const [formRef, setFormRef] = React.useState<HTMLFormElement | null>(null);
  const [isSubmitting] = React.useState(false);

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
      actions={
        <>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={handleCancel}
            disabled={isSubmitting}
            startIcon={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            onClick={() => formRef?.requestSubmit()}
            startIcon={
              mode === "edit" ? <Save size={16} /> : <Plus size={16} />
            }
          >
            {mode === "edit" ? "Save Changes" : "Add Transaction"}
          </Button>
        </>
      }
    >
      <TransactionForm
        onSubmit={handleSubmit}
        editTransaction={mode === "edit" ? props.transaction : undefined}
        showTypeSelector={mode === "create"}
        renderActions={() => null}
        onFormReady={setFormRef}
      />
    </AppDialog>
  );
}
