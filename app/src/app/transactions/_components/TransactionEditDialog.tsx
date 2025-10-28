"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b px-6 py-4">
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin giao dịch của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editTransaction={transaction}
            showTypeSelector={false} // Don't show type selector in edit mode
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
