import React from "react";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Category, Transaction } from "@/services/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VirtualTransactionViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  virtualTransactions: Transaction[];
  categories: Category[];
}

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function VirtualTransactionViewerDialog({
  open,
  onOpenChange,
  virtualTransactions,
  categories,
}: VirtualTransactionViewerDialogProps) {
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "#000000";
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryType = (categoryId: string): "income" | "expense" => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.type || "expense";
  };

  // Calculate statistics
  const virtualIncomeCount = virtualTransactions.filter(
    (tx) => tx.category.type === "income"
  ).length;
  const virtualExpenseCount = virtualTransactions.filter(
    (tx) => tx.category.type === "expense"
  ).length;
  const virtualIncomeTotal = virtualTransactions
    .filter((tx) => tx.category.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const virtualExpenseTotal = virtualTransactions
    .filter((tx) => tx.category.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tất cả giao dịch ảo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {virtualIncomeCount > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Tổng thu ảo: {formatCurrency(virtualIncomeTotal)}
                  </span>
                </div>
              </div>
            )}

            {virtualExpenseCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <EyeOff className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Tổng chi ảo: {formatCurrency(virtualExpenseTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* List of virtual transactions */}
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {virtualTransactions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Không có giao dịch ảo nào
                </div>
              ) : (
                virtualTransactions.map((tx) => {
                  const categoryColor = getCategoryColor(tx.category_id);
                  const categoryName = getCategoryName(tx.category_id);
                  const transactionType =
                    tx.category.type || getCategoryType(tx.category_id);
                  const isResolved = tx.is_resolved !== false;

                  return (
                    <div
                      key={tx.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: categoryColor }}
                          />
                          {!isResolved && (
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {tx.note || "Không có ghi chú"}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                            transactionType === "income"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              transactionType === "income"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {transactionType === "income" ? (
                              <>
                                <TrendingUp size={10} />
                                Thu
                              </>
                            ) : (
                              <>
                                <TrendingDown size={10} />
                                Chi
                              </>
                            )}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {categoryName}
                          </span>
                        </div>

                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(parseISO(tx.created_at), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
