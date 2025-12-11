"use client";
import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { Plus, X, Save } from "lucide-react";
import ResponsiveDialog from "@/components/ui/ResponsiveDialog";
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
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{
        sx: {
          padding: "24px",
        },
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* Form */}
        <TransactionForm
          onSubmit={handleSubmit}
          editTransaction={mode === "edit" ? props.transaction : undefined}
          showTypeSelector={mode === "create"}
          renderActions={() => null}
          onFormReady={setFormRef}
        />

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            marginTop: "24px",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            startIcon={<X size={16} />}
            sx={{
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
              color: (theme) => theme.palette.text.primary,
              "&:hover": {
                borderColor: (theme) =>
                  theme.palette.mode === "dark" ? "#475569" : "#D1D5DB",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.02)",
              },
            }}
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
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#4158D0" : "#3348B0",
              },
              "&:disabled": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#64748B" : "#9CA3AF",
              },
            }}
          >
            {mode === "edit" ? "Save Changes" : "Add Transaction"}
          </Button>
        </Box>
      </Box>
    </ResponsiveDialog>
  );
}
