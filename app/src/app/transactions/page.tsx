"use client";
import React, { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  List,
  Plus,
  AlertCircle,
  Loader2,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react";
import TransactionList from "./_components/TransactionList";
import TransactionForm from "./_components/TransactionForm";
import TransactionEditDialog from "./_components/TransactionEditDialog";
import API, {
  Category,
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
  BalanceStats,
} from "@/services/api/client";

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format currency function (moved to TransactionList component)

export default function TransactionsPage() {
  const queryClient = useQueryClient();

  // Get current month/year for balance
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [hideBalance, setHideBalance] = useState(true);

  // Query categories and transactions
  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: API.categories.getAll,
  });

  // Query current month balance
  const {
    data: balanceStats,
    isLoading: isLoadingBalance,
    isError: isErrorBalance,
    error: balanceError,
  } = useQuery<BalanceStats>({
    queryKey: ["balance-stats", currentMonth, currentYear],
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
  } = useInfiniteQuery({
    queryKey: ["transactions", "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      API.transactions.getWithPagination(PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than PAGE_SIZE, no more pages
      if (lastPage.length < PAGE_SIZE) return undefined;
      // Otherwise, return offset for next page
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    staleTime: 30000, // 30 seconds
  });

  // Flatten all pages into a single array
  const transactions = transactionPages?.pages.flat() ?? [];

  // Mutations for add, update, delete
  const addMutation = useMutation({
    mutationFn: API.transactions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: API.transactions.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: API.transactions.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-stats"] });
    },
  });

  const toggleResolvedMutation = useMutation({
    mutationFn: (data: { id: string; is_resolved: boolean }) =>
      API.transactions.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance-stats"] });
    },
  });

  // Load more transactions function - using React Query pattern
  const loadMoreTransactions = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handlers for add/edit/delete operations
  const handleAddTransaction = (data: TransactionCreateData) => {
    addMutation.mutate(data);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleUpdateTransaction = (data: TransactionUpdateData) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setEditingTransaction(null);
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleResolved = (id: string) => {
    const transaction = transactions.find((tx) => tx.id === id);
    if (transaction) {
      // Toggle logic: undefined/true -> false, false -> true
      const currentResolved = transaction.is_resolved !== false;
      const newResolvedState = !currentResolved;
      toggleResolvedMutation.mutate({
        id: id,
        is_resolved: newResolvedState,
      });
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
      <Card className="shadow-md border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Wallet size={20} />
              Số dư {currentMonth}/{currentYear}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideBalance(!hideBalance)}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              {hideBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </div>
          <CardDescription>Tổng quan tài chính tháng này</CardDescription>
        </CardHeader>
        <CardContent>
          {balanceStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Thu nhập */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                  Thu nhập
                </h3>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {hideBalance
                    ? "•••••••"
                    : formatCurrency(balanceStats.income)}
                </p>
              </div>

              {/* Chi tiêu */}
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                  Chi tiêu
                </h3>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(balanceStats.expense)}
                </p>
              </div>

              {/* Số dư */}
              <div
                className={`text-center p-4 rounded-lg border ${
                  balanceStats.balance >= 0
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                }`}
              >
                <h3
                  className={`text-sm font-medium mb-1 ${
                    balanceStats.balance >= 0
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-orange-700 dark:text-orange-300"
                  }`}
                >
                  Số dư
                </h3>
                <p
                  className={`text-xl font-bold ${
                    balanceStats.balance >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {hideBalance ? (
                    "•••••••"
                  ) : (
                    <>
                      {balanceStats.balance >= 0 ? "+" : ""}
                      {formatCurrency(balanceStats.balance)}
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-20">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Đang tải thông tin số dư...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <CreditCard size={20} />
            Quản lý giao dịch
          </CardTitle>
          <CardDescription>Thêm giao dịch mới</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            categories={allCategories}
            transactions={transactions}
            onSubmit={handleAddTransaction}
            isLoading={addMutation.isPending}
            showTypeSelector={true}
          />

          {(addMutation.isError ||
            deleteMutation.isError ||
            toggleResolvedMutation.isError) && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                {addMutation.isError && (
                  <p>
                    {(addMutation.error as Error)?.message ||
                      "Không thể thêm giao dịch"}
                  </p>
                )}
                {deleteMutation.isError && (
                  <p>
                    {(deleteMutation.error as Error)?.message ||
                      "Không thể xóa giao dịch"}
                  </p>
                )}
                {toggleResolvedMutation.isError && (
                  <p>
                    {(toggleResolvedMutation.error as Error)?.message ||
                      "Không thể cập nhật trạng thái giao dịch"}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <List size={20} />
            Danh sách giao dịch
          </CardTitle>
          <CardDescription>
            {transactions.length} giao dịch{hasNextPage ? " gần nhất" : ""} của
            bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions}
            categories={allCategories} // Pass all categories so TransactionList can handle both types
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleResolved={handleToggleResolved}
            isDeleting={deleteMutation.isPending}
            deletingId={deleteMutation.variables as string}
            isTogglingResolved={toggleResolvedMutation.isPending}
            togglingId={
              toggleResolvedMutation.variables?.id as string | undefined
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingTransaction && (
        <TransactionEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          transaction={editingTransaction}
          categories={allCategories}
          transactions={transactions}
          onUpdate={handleUpdateTransaction}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
