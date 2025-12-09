"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions } from "@/services/react-query/queries";
import {
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useToggleResolvedTransaction,
  useToggleVirtualTransaction,
} from "@/services/react-query/mutations";
import { queryKeys } from "@/services/react-query/query-keys";
import {
  Button,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Fab,
  useTheme,
} from "@mui/material";
import { List, Plus } from "lucide-react";
import { toast } from "sonner";
import TransactionList from "./_components/TransactionList";
import TransactionFormDialog from "./_components/TransactionFormDialog";
import TransactionFilterBox from "./_components/TransactionFilterBox";
import BucketBalanceStatsBox from "./_components/BucketBalanceStatsBox";
import HeatmapDialog from "./_components/HeatmapDialog";
import { useTransactionQueries } from "./_hooks/useTransactionQueries";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Transaction,
  TransactionCreateData,
  TransactionUpdateData,
} from "@/services/api/client";
import AppPageLayout from "../_components/AppPageLayout";
import AppPageNav from "../_components/AppPageNav";

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Get current month/year for balance
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // State for create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // State for heatmap dialog
  const [heatmapDialogOpen, setHeatmapDialogOpen] = useState(false);

  // Use transaction queries hook for filter state management
  const { filters, setSearch, setCategoryId, setOnlyUnresolved, setBucketIds } =
    useTransactionQueries();

  // Debounce the search query - wait 500ms after user stops typing
  const debouncedSearch = useDebounce(filters.search, 500);

  // Open create dialog when `?create=1` is present or when receiving a global event
  useEffect(() => {
    if (searchParams.get("create")) {
      setCreateDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = () => setCreateDialogOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener(
        "open-create-transaction",
        handler as EventListener
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "open-create-transaction",
          handler as EventListener
        );
      }
    };
  }, []);

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

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
  } = useTransactions(PAGE_SIZE, {
    onlyUnresolved: filters.onlyUnresolved,
    onlyVirtual: filters.onlyVirtual,
    search: debouncedSearch || undefined,
    categoryId: filters.categoryId !== "all" ? filters.categoryId : undefined,
    bucketIds: filters.bucketIds,
  });

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

  return (
    <AppPageLayout
      header={
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <AppPageNav title="Transactions" icon={<List />} />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setHeatmapDialogOpen(true)}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            View Heatmap
          </Button>
        </Stack>
      }
    >
      <TransactionFilterBox
        searchQuery={filters.search}
        onSearchChange={setSearch}
        selectedCategoryId={filters.categoryId}
        onCategoryChange={setCategoryId}
        selectedBucketIds={filters.bucketIds}
        onBucketIdsChange={setBucketIds}
        onlyUnresolved={filters.onlyUnresolved}
        onOnlyUnresolvedChange={setOnlyUnresolved}
      />

      {/* Bucket Balance Stats */}
      {filters.bucketIds && filters.bucketIds.length === 1 && (
        <Box sx={{ mt: 4 }}>
          <BucketBalanceStatsBox bucketId={filters.bucketIds[0]} />
        </Box>
      )}

      {isLoadingTransactions ? (
        <Box sx={{ mt: 6, textAlign: "center", p: 2 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading transactions...</Typography>
        </Box>
      ) : isErrorTransactions ? (
        <Box sx={{ mt: 6, textAlign: "center", p: 2 }}>
          <Typography color="error">
            Error: {transactionsError?.message || "Unable to load data"}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 4 }}>
            <TransactionList
              transactions={transactions}
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
          </Box>

          {/* Load More Button */}
          {hasNextPage && (
            <Stack sx={{ justifyContent: "center", mt: 6 }}>
              <Button
                onClick={loadMoreTransactions}
                disabled={isFetchingNextPage}
                variant="outlined"
                color="primary"
                startIcon={
                  isFetchingNextPage ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Plus size={16} />
                  )
                }
              >
                {isFetchingNextPage ? "Loading..." : "Load more transactions"}
              </Button>
            </Stack>
          )}

          {!hasNextPage && transactions.length > 0 && (
            <Typography
              sx={{
                textAlign: "center",
                mt: 6,
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              All transactions displayed
            </Typography>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        aria-label="Add new transaction"
        onClick={() => setCreateDialogOpen(true)}
        sx={{
          position: "fixed",
          bottom: { xs: 80, md: 24 },
          right: 16,
          width: 56,
          height: 56,
          backgroundColor: "#FFB01D",
          color: "#FFFFFF",
          boxShadow: isDark
            ? "0px 4px 12px rgba(0, 0, 0, 0.3)"
            : "0px 4px 12px rgba(255, 176, 29, 0.3)",
          transition: "all 0.2s ease-out",
          zIndex: 50,
          "&:hover": {
            backgroundColor: "#FFC247",
            boxShadow: isDark
              ? "0px 8px 16px rgba(0, 0, 0, 0.4)"
              : "0px 8px 16px rgba(255, 176, 29, 0.4)",
            transform: "scale(1.08)",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
          "& svg": {
            fontSize: 28,
          },
        }}
      >
        <Plus size={28} />
      </Fab>

      {/* Create Dialog */}
      <TransactionFormDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleAddTransaction}
      />

      {/* Edit Dialog */}
      {editingTransaction && (
        <TransactionFormDialog
          mode="edit"
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          transaction={editingTransaction}
          onUpdate={handleUpdateTransaction}
        />
      )}

      {/* Heatmap Dialog */}
      <HeatmapDialog
        open={heatmapDialogOpen}
        onClose={() => setHeatmapDialogOpen(false)}
      />
    </AppPageLayout>
  );
}
