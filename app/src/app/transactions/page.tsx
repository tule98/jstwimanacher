/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  X,
  Save,
  AlertCircle,
  Loader2,
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

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
};

const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch("/api/transactions");
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
};

const addTransaction = async (data: {
  amount: number;
  category_name: string;
  note: string;
  created_at: string;
}): Promise<any> => {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to add transaction");
  }
  return response.json();
};

const updateTransaction = async (data: {
  index: number;
  amount?: number;
  category_name?: string;
  note?: string;
  created_at?: string;
}): Promise<any> => {
  const response = await fetch("/api/transactions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update transaction");
  }
  return response.json();
};

const deleteTransaction = async (index: number): Promise<any> => {
  const response = await fetch(`/api/transactions?index=${index}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete transaction");
  }
  return response.json();
};

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

  // Query categories and transactions
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: transactionsError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  // Mutations for add, update, delete
  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const [form, setForm] = useState({
    amount: "",
    category_name: "",
    note: "",
    created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"), // Format for datetime-local input
  });
  const [rawAmount, setRawAmount] = useState(""); // Store raw numeric value
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Transaction[]>([]);

  // Initialize form with default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && form.category_name === "") {
      const defaultCategory = categories.find(
        (cat) => cat.name === "Thiết yếu: Ăn uống cá nhân"
      );
      setForm((prev) => ({
        ...prev,
        category_name: defaultCategory?.name || categories[0].name,
      }));
    }
  }, [categories, form.category_name]);

  // Update suggestions when note changes or on focus
  useEffect(() => {
    if (showSuggestions) {
      // Get transactions from yesterday
      const yesterday = startOfDay(subDays(new Date(), 1));
      const yesterdayTransactions = transactions
        .filter((tx) => {
          const txDate = startOfDay(parseISO(tx.created_at));
          return isEqual(txDate, yesterday) && tx.note && tx.note.trim();
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
  }, [form.note, showSuggestions]);

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
      category_name: transaction.category_name, // Update category as well
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editIdx !== null) {
      // Edit mode
      updateMutation.mutate({
        index: editIdx,
        amount: Number(rawAmount),
        category_name: form.category_name,
        note: form.note,
        created_at: form.created_at,
      });
      setEditIdx(null);
    } else {
      // Add mode
      addMutation.mutate({
        amount: Number(rawAmount),
        category_name: form.category_name,
        note: form.note,
        created_at: form.created_at,
      });
    }

    // Reset form but keep created_at
    const currentCreatedAt = form.created_at;
    setForm({
      amount: "",
      category_name:
        categories.find((cat) => cat.name === "Thiết yếu: Ăn uống cá nhân")
          ?.name ||
        categories[0]?.name ||
        "",
      note: "",
      created_at: currentCreatedAt, // Keep the current datetime
    });
    setRawAmount("");
  };

  const handleEdit = (idx: number) => {
    const tx = transactions[idx];
    const amountStr = tx.amount.toString();
    setRawAmount(amountStr);
    setForm({
      amount: Number(amountStr).toLocaleString("vi-VN"),
      category_name: tx.category_name,
      note: tx.note || "",
      created_at: format(parseISO(tx.created_at), "yyyy-MM-dd'T'HH:mm"),
    });
    setEditIdx(idx);
  };

  const handleDelete = (idx: number) => {
    deleteMutation.mutate(idx);
    if (editIdx === idx) {
      setEditIdx(null);
      const currentCreatedAt = form.created_at;
      setForm({
        amount: "",
        category_name:
          categories.find((cat) => cat.name === "Thiết yếu: Ăn uống cá nhân")
            ?.name ||
          categories[0]?.name ||
          "",
        note: "",
        created_at: currentCreatedAt,
      });
      setRawAmount("");
    }
  };

  if (isLoadingTransactions) {
    return <div className="max-w-md mx-auto p-4">Đang tải dữ liệu...</div>;
  }

  if (isErrorTransactions) {
    return (
      <div className="max-w-md mx-auto p-4 text-red-500">
        Lỗi: {(transactionsError as Error)?.message || "Không thể tải dữ liệu"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <CreditCard size={20} />
            Nhập khoản chi tiêu
          </CardTitle>
          <CardDescription>
            Thêm khoản chi tiêu mới hoặc chỉnh sửa khoản chi hiện có
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  id="note"
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  onFocus={() => {
                    // Get transactions from yesterday on focus
                    const yesterday = startOfDay(subDays(new Date(), 1));
                    const yesterdayTransactions = transactions
                      .filter((tx) => {
                        const txDate = startOfDay(parseISO(tx.created_at));
                        return (
                          isEqual(txDate, yesterday) &&
                          tx.note &&
                          tx.note.trim()
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
                        categories.find(
                          (cat) => cat.name === suggestion.category_name
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
                                {suggestion.category_name}
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
                Danh mục
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const isSelected = form.category_name === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      tabIndex={-1}
                      onClick={() =>
                        setForm({ ...form, category_name: cat.name })
                      }
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
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="created_at"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Thời gian
              </label>
              <input
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
                      created_at: format(twoDaysAgo, "yyyy-MM-dd'T'HH:mm"),
                    });
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
                      created_at: format(yesterday, "yyyy-MM-dd'T'HH:mm"),
                    });
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
                      created_at: format(today, "yyyy-MM-dd'T'HH:mm"),
                    });
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
                ) : editIdx !== null ? (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Cập nhật
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                  </>
                )}
              </Button>

              {editIdx !== null && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => {
                    setEditIdx(null);
                    const currentCreatedAt = form.created_at;
                    setForm({
                      amount: "",
                      category_name:
                        categories.find(
                          (cat) => cat.name === "Thiết yếu: Ăn uống cá nhân"
                        )?.name ||
                        categories[0]?.name ||
                        "",
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
            deleteMutation.isError) && (
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary dark:text-green-400">
            <List size={20} />
            Danh sách khoản chi
          </CardTitle>
          <CardDescription>
            Danh sách tất cả các khoản chi tiêu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions}
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            deletingIndex={deleteMutation.variables as number}
          />
        </CardContent>
      </Card>
    </div>
  );
}
