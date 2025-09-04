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
  Category,
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
} from "@/services/api/client";

interface TransactionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  categories: Category[];
  transactions: Transaction[];
  onUpdate: (data: TransactionUpdateData) => void;
  isLoading?: boolean;
}

export default function TransactionEditDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  transactions,
  onUpdate,
  isLoading = false,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin giao dịch của bạn
          </DialogDescription>
        </DialogHeader>

        <TransactionForm
          categories={categories}
          transactions={transactions}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          editTransaction={transaction}
          showTypeSelector={false} // Don't show type selector in edit mode
        />
      </DialogContent>
    </Dialog>
  );
}
