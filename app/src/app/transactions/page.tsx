"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCategories, useTransactions } from "@/services/react-query/queries";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useToggleResolvedTransaction,
  useToggleVirtualTransaction,
} from "@/services/react-query/mutations";
import { queryKeys } from "@/services/react-query/query-keys";
import { AppHighlightBlock } from "@/components/ui/app-highlight-block";
import { Button } from "@/components/ui/button";
import { List, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import TransactionList from "./_components/TransactionList";
import TransactionCreateDialog from "./_components/TransactionCreateDialog";
import TransactionEditDialog from "./_components/TransactionEditDialog";
import TransactionStatsSections from "./_components/TransactionStatsSections";
import API, {
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
  BalanceStats,
} from "@/services/api/client";

export default function TransactionsPage() {
  const queryClient = useQueryClient();

  // Get current month/year for balance
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // State for create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Query categories and transactions
  const { data: allCategories = [] } = useCategories();

  // Query current month balance
  const {
    data: balanceStats,
    isLoading: isLoadingBalance,
    isError: isErrorBalance,
    error: balanceError,
  } = useQuery<BalanceStats>({
    queryKey: queryKeys.balance.stats(currentMonth, currentYear),
    queryFn: () => API.stats.getBalanceStats(currentMonth, currentYear),
  });

  // Infinite query for transactions - proper React Query pattern
  const PAGE_SIZE = 20;

  const {
    data: transactionPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: transactionsError,
  } = useTransactions(PAGE_SIZE);

  // Flatten all pages into a single array
  const transactions = transactionPages?.pages.flat() ?? [];

  // Mutations for add, update, delete
  const addMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const toggleResolvedMutation = useToggleResolvedTransaction();
  const toggleVirtualMutation = useToggleVirtualTransaction();

  // Load more transactions function - using React Query pattern
  const loadMoreTransactions = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handlers for add/edit/delete operations
  const handleAddTransaction = (data: TransactionCreateData) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.balance.stats(currentMonth, currentYear),
        });
        toast.success("Transaction created successfully!");
      },
      onError: (error) => {
        toast.error("Failed to add transaction", {
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
      },
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleUpdateTransaction = (data: TransactionUpdateData) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.balance.stats(currentMonth, currentYear),
        });
        setEditDialogOpen(false);
        setEditingTransaction(null);
      },
      onError: (error) => {
        toast.error("Failed to update transaction", {
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.balance.stats(currentMonth, currentYear),
        });
        toast.success("Transaction deleted successfully!");
      },
      onError: (error) => {
        toast.error("Failed to delete transaction", {
          description:
            error instanceof Error ? error.message : "An error occurred",
        });
      },
    });
  };

  const handleToggleResolved = (id: string) => {
    const transaction = transactions.find((tx) => tx.id === id);
    if (transaction) {
      // Toggle logic: undefined/true -> false, false -> true
      const currentResolved = transaction.is_resolved !== false;
      const newResolvedState = !currentResolved;
      toggleResolvedMutation.mutate(
        {
          id: id,
          is_resolved: newResolvedState,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: queryKeys.balance.stats(currentMonth, currentYear),
            });
            toast.success(
              newResolvedState
                ? "Transaction marked as resolved"
                : "Transaction marked as unresolved"
            );
          },
          onError: (error) => {
            toast.error("Failed to update transaction status", {
              description:
                error instanceof Error ? error.message : "An error occurred",
            });
          },
        }
      );
    }
  };

  const handleToggleVirtual = (id: string) => {
    const transaction = transactions.find((tx) => tx.id === id);
    if (transaction) {
      // Toggle logic: undefined/false -> true, true -> false
      const currentVirtual = transaction.is_virtual === true;
      const newVirtualState = !currentVirtual;
      toggleVirtualMutation.mutate(
        {
          id: id,
          is_virtual: newVirtualState,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: queryKeys.balance.stats(currentMonth, currentYear),
            });
            toast.success(
              newVirtualState
                ? "Transaction marked as virtual"
                : "Transaction marked as real"
            );
          },
          onError: (error) => {
            toast.error("Failed to update transaction status", {
              description:
                error instanceof Error ? error.message : "An error occurred",
            });
          },
        }
      );
    }
  };

  if (isLoadingTransactions || isLoadingBalance) {
    return <div className="max-w-md mx-auto p-4">Đang tải dữ liệu...</div>;
  }

  if (isErrorTransactions || isErrorBalance) {
    return (
      <div className="max-w-md mx-auto p-4 text-red-500">
        Lỗi:{" "}
        {((isErrorTransactions ? transactionsError : balanceError) as Error)
          ?.message || "Không thể tải dữ liệu"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      {/* Balance Overview Card */}
      <TransactionStatsSections
        balanceStats={balanceStats}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />

      <AppHighlightBlock
        title="Danh sách giao dịch"
        description={`${transactions.length} giao dịch${
          hasNextPage ? " gần nhất" : ""
        } của bạn`}
        icon={List}
        variant="default"
      >
        <TransactionList
          transactions={transactions}
          categories={allCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleResolved={handleToggleResolved}
          onToggleVirtual={handleToggleVirtual}
          isDeleting={deleteMutation.isPending}
          deletingId={deleteMutation.variables as string}
          isTogglingResolved={toggleResolvedMutation.isPending}
          togglingId={
            toggleResolvedMutation.variables?.id as string | undefined
          }
          isTogglingVirtual={toggleVirtualMutation.isPending}
          togglingVirtualId={
            toggleVirtualMutation.variables?.id as string | undefined
          }
        />

        {/* Load More Button */}
        {hasNextPage && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={loadMoreTransactions}
              disabled={isFetchingNextPage}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-400 dark:hover:text-gray-900"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tải thêm giao dịch
                </>
              )}
            </Button>
          </div>
        )}

        {!hasNextPage && transactions.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Đã hiển thị tất cả giao dịch
          </div>
        )}
      </AppHighlightBlock>

      {/* Floating Action Button */}
      <button
        onClick={() => setCreateDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 flex items-center justify-center group hover:shadow-xl"
        aria-label="Add new transaction"
      >
        <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Create Dialog */}
      <TransactionCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleAddTransaction}
      />

      {/* Edit Dialog */}
      {editingTransaction && (
        <TransactionEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          transaction={editingTransaction}
          onUpdate={handleUpdateTransaction}
        />
      )}
    </div>
  );
}
