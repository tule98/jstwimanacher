"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  List,
  Plus,
  X,
  Save,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  subDays,
  format,
  isEqual,
  parseISO,
  startOfDay,
  compareDesc,
} from "date-fns";
import TransactionList from "./_components/TransactionList";
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

  // Separate income and expense categories
  const incomeCategories = allCategories.filter((cat) => cat.type === "income");
  const expenseCategories = allCategories.filter(
    (cat) => cat.type === "expense"
  );

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

  const [form, setForm] = useState({
    amount: "",
    category_id: "",
    note: "",
    created_at: format(new Date(), "yyyy-MM-dd'T'00:00"), // Always set time to 00:00
  });
  const [rawAmount, setRawAmount] = useState(""); // Store raw numeric value
  const [editId, setEditId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Transaction[]>([]);
  const [activeType, setActiveType] = useState<"income" | "expense">("expense"); // Track current transaction type
  const [hideBalance, setHideBalance] = useState(true); // State để ẩn/hiện thu nhập và số dư
  const noteInputRef = useRef<HTMLInputElement>(null);
  const datetimeInputRef = useRef<HTMLInputElement>(null);

  // Get current categories based on active type
  const categories =
    activeType === "income" ? incomeCategories : expenseCategories;

  // Initialize form with default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && form.category_id === "") {
      // For expense, try to find default category, otherwise use first available
      const defaultCategory =
        activeType === "expense"
          ? categories.find((cat) => cat.name === "Ăn uống cá nhân")
          : null;
      setForm((prev) => ({
        ...prev,
        category_id: defaultCategory?.id || categories[0]?.id || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category_id, activeType]);

  // Update suggestions when note changes or on focus
  useEffect(() => {
    if (showSuggestions) {
      // Get transactions from yesterday with same type
      const yesterday = startOfDay(subDays(new Date(), 1));
      const yesterdayTransactions = transactions
        .filter((tx) => {
          const txDate = startOfDay(parseISO(tx.created_at));
          return (
            isEqual(txDate, yesterday) &&
            tx.note &&
            tx.note.trim() &&
            tx.category.type === activeType
          ); // Filter by current transaction type
        })
        .sort((a, b) =>
          compareDesc(parseISO(a.created_at), parseISO(b.created_at))
        )
        .slice(0, 5);

      if (form.note.trim()) {
        // Filter by note text if user is typing
        const filteredSuggestions = yesterdayTransactions.filter(
          (tx) =>
            tx.note && tx.note.toLowerCase().includes(form.note.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        // Show all yesterday transactions if just focused
        setSuggestions(yesterdayTransactions);
      }
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.note, showSuggestions, activeType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // Remove any non-digit characters
      const numericValue = value.replace(/[^\d]/g, "");
      setRawAmount(numericValue);

      // Format for display in input
      if (numericValue) {
        const formattedValue = Number(numericValue).toLocaleString("vi-VN");
        setForm({ ...form, amount: formattedValue });
      } else {
        setForm({ ...form, amount: "" });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (transaction: Transaction) => {
    const amountStr = transaction.amount.toString();
    setRawAmount(amountStr);
    setForm((prev) => ({
      ...prev,
      note: transaction.note || "",
      amount: Number(amountStr).toLocaleString("vi-VN"),
      category_id: transaction.category_id, // Update category as well
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editId !== null) {
      // Edit mode
      const updateData: TransactionUpdateData = {
        id: editId,
        amount: Number(rawAmount),
        category_id: form.category_id,
        note: form.note,
        created_at: form.created_at,
      };
      updateMutation.mutate(updateData);
      setEditId(null);
    } else {
      // Add mode - generate new ID
      const createData: TransactionCreateData = {
        amount: Number(rawAmount),
        category_id: form.category_id,
        note: form.note,
        created_at: form.created_at,
      };
      addMutation.mutate(createData);
    }

    // Reset form but keep created_at
    const currentCreatedAt = form.created_at;
    const defaultCategory =
      activeType === "expense"
        ? categories.find((cat) => cat.name === "Ăn uống cá nhân")
        : null;
    setForm({
      amount: "",
      category_id: defaultCategory?.id || categories[0]?.id || "",
      note: "",
      created_at: currentCreatedAt, // Keep the current datetime
    });
    setRawAmount("");
  };

  const handleEdit = (transaction: Transaction) => {
    const amountStr = transaction.amount.toString();
    setRawAmount(amountStr);

    // Set the active type based on transaction type
    setActiveType(transaction.category.type || "expense");

    setForm({
      amount: Number(amountStr).toLocaleString("vi-VN"),
      category_id: transaction.category_id,
      note: transaction.note || "",
      created_at: format(
        parseISO(transaction.created_at),
        "yyyy-MM-dd'T'00:00"
      ),
    });
    setEditId(transaction.id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    if (editId === id) {
      setEditId(null);
      const currentCreatedAt = form.created_at;
      const defaultCategory =
        activeType === "expense"
          ? categories.find((cat) => cat.name === "Ăn uống cá nhân")
          : null;
      setForm({
        amount: "",
        category_id: defaultCategory?.id || categories[0]?.id || "",
        note: "",
        created_at: currentCreatedAt,
      });
      setRawAmount("");
    }
  };

  const handleToggleResolved = (id: string) => {
    const transaction = transactions.find((tx) => tx.id === id);
    if (transaction) {
      // Toggle logic: undefined/true -> false, false -> true
      // Default is resolved (true), so undefined is treated as resolved
      const currentResolved = transaction.is_resolved !== false; // undefined or true means resolved
      const newResolvedState = !currentResolved; // Toggle the state
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
          <CardDescription>
            Thêm khoản {activeType === "income" ? "thu nhập" : "chi tiêu"} mới
            hoặc chỉnh sửa giao dịch hiện có
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Transaction Type Selector */}
          <div className="mb-6">
            <Tabs
              value={activeType}
              onValueChange={(value: string) => {
                const newType = value as "income" | "expense";
                setActiveType(newType);
                // Reset form when changing type
                const currentCreatedAt = form.created_at;
                const newCategories =
                  newType === "income" ? incomeCategories : expenseCategories;
                const defaultCategory =
                  newType === "expense"
                    ? newCategories.find(
                        (cat) => cat.name === "Ăn uống cá nhân"
                      )
                    : null;
                setForm({
                  amount: "",
                  category_id:
                    defaultCategory?.id || newCategories[0]?.id || "",
                  note: "",
                  created_at: currentCreatedAt,
                });
                setRawAmount("");
                setEditId(null);
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="expense"
                  className="flex items-center gap-2"
                >
                  <TrendingDown size={16} />
                  Chi tiêu ({expenseCategories.length} danh mục)
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  Thu nhập ({incomeCategories.length} danh mục)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2 relative">
                <label
                  htmlFor="note"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ghi chú
                </label>
                <input
                  ref={noteInputRef}
                  id="note"
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  onFocus={() => {
                    // Get transactions from yesterday on focus with same type
                    const yesterday = startOfDay(subDays(new Date(), 1));
                    const yesterdayTransactions = transactions
                      .filter((tx) => {
                        const txDate = startOfDay(parseISO(tx.created_at));
                        return (
                          isEqual(txDate, yesterday) &&
                          tx.note &&
                          tx.note.trim() &&
                          tx.category.type === activeType // Filter by current type
                        );
                      })
                      .sort((a, b) =>
                        compareDesc(
                          parseISO(a.created_at),
                          parseISO(b.created_at)
                        )
                      )
                      .slice(0, 5);

                    if (yesterdayTransactions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding to allow clicking suggestions
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  placeholder="Nhập ghi chú"
                  className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => {
                      const categoryColor =
                        allCategories.find(
                          (cat) => cat.id === suggestion.category_id
                        )?.color || "#000000";
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
                              {suggestion.note}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400 ml-2 whitespace-nowrap">
                              {formatCurrency(suggestion.amount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: categoryColor }}
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {allCategories.find(
                                  (cat) => cat.id === suggestion.category_id
                                )?.name || "Unknown"}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 ml-2">
                              {format(
                                parseISO(suggestion.created_at),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Số tiền
                </label>
                <input
                  id="amount"
                  type="text"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Nhập số tiền"
                  className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Danh mục {activeType === "income" ? "thu nhập" : "chi tiêu"}
              </label>
              {categories.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                  Chưa có danh mục{" "}
                  {activeType === "income" ? "thu nhập" : "chi tiêu"} nào. Hãy
                  thêm danh mục trong{" "}
                  <a
                    href="/categories"
                    className="text-blue-500 hover:underline"
                  >
                    trang quản lý danh mục
                  </a>
                  .
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const isSelected = form.category_id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        tabIndex={-1}
                        onClick={() => {
                          setForm({ ...form, category_id: cat.id });
                          setTimeout(() => noteInputRef.current?.focus(), 0);
                        }}
                        className={`px-2.5 py-1 rounded-full border-2 text-xs font-medium transition-all duration-200 hover:shadow-md whitespace-nowrap ${
                          isSelected
                            ? "border-transparent shadow-md text-white"
                            : "bg-white dark:bg-gray-800 hover:shadow-sm"
                        }`}
                        style={{
                          backgroundColor: isSelected ? cat.color : undefined,
                          borderColor: isSelected ? "transparent" : cat.color,
                          color: isSelected ? "#ffffff" : cat.color,
                        }}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="created_at"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Thời gian
              </label>
              <input
                ref={datetimeInputRef}
                id="created_at"
                type="datetime-local"
                name="created_at"
                value={form.created_at}
                onChange={handleChange}
                className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />

              {/* Quick time selection tags */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    const twoDaysAgo = subDays(new Date(), 2);
                    setForm({
                      ...form,
                      created_at: format(twoDaysAgo, "yyyy-MM-dd'T'00:00"),
                    });
                    setTimeout(() => datetimeInputRef.current?.focus(), 0);
                  }}
                  className="px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors"
                >
                  2 ngày trước
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    const yesterday = subDays(new Date(), 1);
                    setForm({
                      ...form,
                      created_at: format(yesterday, "yyyy-MM-dd'T'00:00"),
                    });
                    setTimeout(() => datetimeInputRef.current?.focus(), 0);
                  }}
                  className="px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors"
                >
                  Hôm qua
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    const today = new Date();
                    setForm({
                      ...form,
                      created_at: format(today, "yyyy-MM-dd'T'00:00"),
                    });
                    setTimeout(() => datetimeInputRef.current?.focus(), 0);
                  }}
                  className="px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors"
                >
                  Hôm nay
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                  </>
                ) : editId !== null ? (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Cập nhật
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                  </>
                )}
              </Button>

              {editId !== null && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => {
                    setEditId(null);
                    const currentCreatedAt = form.created_at;
                    const defaultCategory =
                      activeType === "expense"
                        ? categories.find(
                            (cat) => cat.name === "Ăn uống cá nhân"
                          )
                        : null;
                    setForm({
                      amount: "",
                      category_id:
                        defaultCategory?.id || categories[0]?.id || "",
                      note: "",
                      created_at: currentCreatedAt,
                    });
                    setRawAmount("");
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Huỷ chỉnh sửa
                </Button>
              )}
            </div>
          </form>

          {(addMutation.isError ||
            updateMutation.isError ||
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
                {updateMutation.isError && (
                  <p>
                    {(updateMutation.error as Error)?.message ||
                      "Không thể cập nhật giao dịch"}
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
    </div>
  );
}
