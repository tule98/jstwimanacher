import React from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { Category, Transaction } from "@/services/api/client";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleResolved: (id: string) => void;
  isDeleting: boolean;
  deletingId?: string;
  isTogglingResolved: boolean;
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

export default function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
  onToggleResolved,
  isDeleting,
  deletingId,
  isTogglingResolved,
  togglingId,
}: TransactionListProps) {
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

  const groupedTransactions = groupTransactionsByDay(transactions);
  const unresolvedCount = transactions.filter(
    (tx) => tx.is_resolved === false
  ).length;
  const unresolvedTotal = transactions
    .filter((tx) => tx.is_resolved === false)
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Chưa có giao dịch nào. Hãy thêm giao dịch mới!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary for unresolved transactions */}
      {unresolvedCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Có {unresolvedCount} giao dịch cần xem xét lại (
              {formatCurrency(unresolvedTotal)})
            </span>
          </div>
        </div>
      )}

      {groupedTransactions.map(({ date, transactions: dayTransactions }) => {
        const isToday = isSameDay(date, new Date());
        const isYesterday = isSameDay(
          date,
          new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        let dateLabel = format(date, "dd/MM/yyyy - EEEE", {
          locale: undefined,
        });
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
            <div className="space-y-2">
              {/* Desktop: All in one line */}
              <div className="hidden md:flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dateLabel}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Show unresolved count for this day */}
                  {dayTransactions.some((tx) => tx.is_resolved === false) && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                      {
                        dayTransactions.filter((tx) => tx.is_resolved === false)
                          .length
                      }{" "}
                      cần xem xét
                    </span>
                  )}
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
              </div>

              {/* Mobile: Split into 2 lines */}
              <div className="md:hidden border-b border-gray-200 dark:border-gray-700 pb-2">
                {/* First line: Date + unresolved count */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {dateLabel}
                  </h3>
                  {dayTransactions.some((tx) => tx.is_resolved === false) && (
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                      {
                        dayTransactions.filter((tx) => tx.is_resolved === false)
                          .length
                      }{" "}
                      cần xem xét
                    </span>
                  )}
                </div>

                {/* Second line: Financial summary */}
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold flex items-center gap-2 flex-wrap justify-center">
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
              </div>
            </div>

            {/* Transactions table for this day */}
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="hidden md:block">
                {/* Desktop table header */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">Ghi chú</div>
                    <div className="col-span-3">Danh mục</div>
                    <div className="col-span-2">Số tiền</div>
                    <div className="col-span-2">Thao tác</div>
                  </div>
                </div>

                {/* Desktop table body */}
                <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {dayTransactions.map((tx) => {
                    const categoryColor = getCategoryColor(tx.category_id);
                    const categoryName = getCategoryName(tx.category_id);
                    const transactionType =
                      tx.category.type || getCategoryType(tx.category_id);
                    const isResolved = tx.is_resolved !== false;
                    const isUnresolved = !isResolved;

                    return (
                      <div
                        key={tx.id}
                        className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          isUnresolved
                            ? "bg-yellow-50 dark:bg-yellow-900/10"
                            : ""
                        }`}
                      >
                        {/* Status column */}
                        <div className="col-span-1 flex items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            {isUnresolved && (
                              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                            )}
                          </div>
                        </div>

                        {/* Note column */}
                        <div className="col-span-4 flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {tx.note || "Không có ghi chú"}
                          </span>
                        </div>

                        {/* Category column */}
                        <div className="col-span-3 flex items-center">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap ${
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
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate text-nowrap line-clamp-1">
                              {categoryName}
                            </span>
                          </div>
                        </div>

                        {/* Amount column */}
                        <div className="col-span-2 flex items-center">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              transactionType === "income"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>

                        {/* Actions column */}
                        <div className="col-span-2 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 transition-colors ${
                              isResolved
                                ? "text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                : "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                            }`}
                            onClick={() => onToggleResolved(tx.id)}
                            disabled={isDeleting || isTogglingResolved}
                            title={
                              isResolved
                                ? "Đánh dấu cần xem xét lại"
                                : "Đánh dấu đã xác nhận"
                            }
                          >
                            {isTogglingResolved && togglingId === tx.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isResolved ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            onClick={() => onEdit(tx)}
                            disabled={isDeleting || isTogglingResolved}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => onDelete(tx.id)}
                            disabled={isDeleting || isTogglingResolved}
                          >
                            {isDeleting && deletingId === tx.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile layout - 2 lines per transaction */}
              <div className="md:hidden">
                <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {dayTransactions.map((tx) => {
                    const categoryColor = getCategoryColor(tx.category_id);
                    const categoryName = getCategoryName(tx.category_id);
                    const transactionType =
                      tx.category.type || getCategoryType(tx.category_id);
                    const isResolved = tx.is_resolved !== false;
                    const isUnresolved = !isResolved;

                    return (
                      <div
                        key={tx.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          isUnresolved
                            ? "bg-yellow-50 dark:bg-yellow-900/10"
                            : ""
                        }`}
                      >
                        {/* First line: Status, Note, Amount */}
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            {isUnresolved && (
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

                        {/* Second line: Category + Type, Actions */}
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
                            <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                              {categoryName}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 transition-colors ${
                                isResolved
                                  ? "text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                  : "text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                              }`}
                              onClick={() => onToggleResolved(tx.id)}
                              disabled={isDeleting || isTogglingResolved}
                              title={
                                isResolved
                                  ? "Đánh dấu cần xem xét lại"
                                  : "Đánh dấu đã xác nhận"
                              }
                            >
                              {isTogglingResolved && togglingId === tx.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isResolved ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              onClick={() => onEdit(tx)}
                              disabled={isDeleting || isTogglingResolved}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => onDelete(tx.id)}
                              disabled={isDeleting || isTogglingResolved}
                            >
                              {isDeleting && deletingId === tx.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
