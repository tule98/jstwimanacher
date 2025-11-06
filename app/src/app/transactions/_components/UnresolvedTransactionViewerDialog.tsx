import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { Category, Transaction } from "@/services/api/client";

interface UnresolvedTransactionViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unresolvedTransactions: Transaction[];
  categories: Category[];
  onEdit?: (transaction: Transaction) => void;
  onToggleResolved?: (id: string) => void;
  isTogglingResolved?: boolean;
  togglingId?: string;
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

// Group transactions by day
const groupTransactionsByDay = (transactions: Transaction[]) => {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((tx) => {
    const date = parseISO(tx.created_at);
    const dateKey = format(date, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });

  // Sort groups by date (newest first) and sort transactions within each group by time (newest first)
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, txs]) => ({
      date: parseISO(dateKey),
      transactions: txs.sort(
        (a, b) =>
          parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
      ),
    }));
};

export default function UnresolvedTransactionViewerDialog({
  open,
  onOpenChange,
  unresolvedTransactions,
  categories,
  onEdit,
  onToggleResolved,
  isTogglingResolved,
  togglingId,
}: UnresolvedTransactionViewerDialogProps) {
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

  const groupedTransactions = groupTransactionsByDay(unresolvedTransactions);

  // Calculate totals
  const totalIncome = unresolvedTransactions
    .filter((tx) => tx.category.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = unresolvedTransactions
    .filter((tx) => tx.category.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  if (unresolvedTransactions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Giao dịch cần xem xét lại
            </DialogTitle>
            <DialogDescription>
              Danh sách tất cả các giao dịch chưa được xác nhận
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Không có giao dịch nào cần xem xét lại
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Giao dịch cần xem xét lại ({unresolvedTransactions.length})
          </DialogTitle>
          <DialogDescription>
            Danh sách tất cả các giao dịch chưa được xác nhận
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Thu nhập
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Chi tiêu
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                totalBalance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(Math.abs(totalBalance))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalBalance >= 0 ? "Thặng dư" : "Thiếu hụt"}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {groupedTransactions.map(
            ({ date, transactions: dayTransactions }) => {
              const isToday = isSameDay(date, new Date());
              const isYesterday = isSameDay(
                date,
                new Date(Date.now() - 24 * 60 * 60 * 1000)
              );

              let dateLabel = format(date, "dd/MM/yyyy - EEEE");
              if (isToday) {
                dateLabel = "Hôm nay - " + format(date, "dd/MM/yyyy");
              } else if (isYesterday) {
                dateLabel = "Hôm qua - " + format(date, "dd/MM/yyyy");
              }

              // Calculate daily total (income - expense)
              const dailyIncome = dayTransactions
                .filter((tx) => tx.category.type === "income")
                .reduce((sum, tx) => sum + tx.amount, 0);
              const dailyExpense = dayTransactions
                .filter((tx) => tx.category.type === "expense")
                .reduce((sum, tx) => sum + tx.amount, 0);
              const dailyBalance = dailyIncome - dailyExpense;

              return (
                <div key={format(date, "yyyy-MM-dd")} className="space-y-2">
                  {/* Date Header */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dateLabel}
                    </h3>
                    <span className="text-sm font-semibold flex items-center gap-2">
                      {dailyIncome > 0 && (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <TrendingUp size={12} />
                          {formatCurrency(dailyIncome)}
                        </span>
                      )}
                      {dailyExpense > 0 && (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                          <TrendingDown size={12} />
                          {formatCurrency(dailyExpense)}
                        </span>
                      )}
                      {dailyIncome > 0 && dailyExpense > 0 && (
                        <span
                          className={`${
                            dailyBalance >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          (={formatCurrency(Math.abs(dailyBalance))})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Transactions */}
                  <div className="space-y-2">
                    {dayTransactions.map((tx) => {
                      const categoryColor = getCategoryColor(tx.category_id);
                      const categoryName = getCategoryName(tx.category_id);
                      const transactionType =
                        tx.category.type || getCategoryType(tx.category_id);

                      return (
                        <div
                          key={tx.id}
                          className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            {/* Left side: Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: categoryColor }}
                                />
                                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {tx.note || "Không có ghi chú"}
                                  </span>
                                  {tx.is_virtual && (
                                    <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full whitespace-nowrap flex-shrink-0">
                                      Ảo
                                    </span>
                                  )}
                                </div>
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
                                  <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {categoryName}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {format(parseISO(tx.created_at), "HH:mm")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right side: Amount and Actions */}
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                  transactionType === "income"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                }`}
                              >
                                {formatCurrency(tx.amount)}
                              </span>

                              {onEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                  onClick={() => onEdit(tx)}
                                  title="Chỉnh sửa giao dịch"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}

                              {onToggleResolved && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                  onClick={() => onToggleResolved(tx.id)}
                                  disabled={isTogglingResolved}
                                  title="Đánh dấu đã xác nhận"
                                >
                                  {isTogglingResolved &&
                                  togglingId === tx.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
