import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

interface Category {
  name: string;
  color: string;
}

interface Transaction {
  amount: number;
  category_name: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isDeleting: boolean;
  deletingIndex?: number;
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
  isDeleting,
  deletingIndex,
}: TransactionListProps) {
  const getCategoryColor = (name: string): string => {
    const category = categories.find((cat) => cat.name === name);
    return category?.color || "#000000";
  };

  const groupedTransactions = groupTransactionsByDay(transactions);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Chưa có khoản chi nào. Hãy thêm khoản chi mới!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedTransactions.map(
        ({ date, transactions: dayTransactions }, groupIndex) => {
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

          // Calculate daily total
          const dailyTotal = dayTransactions.reduce(
            (sum, tx) => sum + tx.amount,
            0
          );

          return (
            <div key={format(date, "yyyy-MM-dd")} className="space-y-2">
              {/* Date Header */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dateLabel}
                </h3>
                <span className="text-sm font-semibold text-primary dark:text-green-400">
                  {formatCurrency(dailyTotal)}
                </span>
              </div>

              {/* Transactions for this day */}
              <div className="space-y-1.5">
                {dayTransactions.map((tx, txIndex) => {
                  // Calculate the original index in the full transactions array
                  const originalIndex = transactions.findIndex(
                    (originalTx) =>
                      originalTx.amount === tx.amount &&
                      originalTx.category_name === tx.category_name &&
                      originalTx.note === tx.note &&
                      originalTx.created_at === tx.created_at
                  );

                  const categoryColor = getCategoryColor(tx.category_name);

                  return (
                    <div
                      key={`${originalIndex}-${txIndex}`}
                      className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {tx.note || "Không có ghi chú"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {tx.category_name}
                            </span>
                          </div>
                        </div>

                        {/* Amount pill */}
                        <div className="flex-shrink-0">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full whitespace-nowrap">
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>

                        {/* Action buttons - always visible */}
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            onClick={() => onEdit(originalIndex)}
                            disabled={isDeleting}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => onDelete(originalIndex)}
                            disabled={isDeleting}
                          >
                            {isDeleting && deletingIndex === originalIndex ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
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
  );
}
