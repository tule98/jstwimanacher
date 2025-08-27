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
  Save,
  Plus,
  X,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  FileQuestion,
  Loader2,
} from "lucide-react";

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
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Initialize form with the first category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && form.category_name === "") {
      setForm((prev) => ({ ...prev, category_name: categories[0].name }));
    }
  }, [categories]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editIdx !== null) {
      // Edit mode
      updateMutation.mutate({
        index: editIdx,
        amount: Number(form.amount),
        category_name: form.category_name,
        note: form.note,
      });
      setEditIdx(null);
    } else {
      // Add mode
      addMutation.mutate({
        amount: Number(form.amount),
        category_name: form.category_name,
        note: form.note,
      });
    }

    setForm({ amount: "", category_name: categories[0]?.name || "", note: "" });
  };

  const handleEdit = (idx: number) => {
    const tx = transactions[idx];
    setForm({
      amount: tx.amount.toString(),
      category_name: tx.category_name,
      note: tx.note || "",
    });
    setEditIdx(idx);
  };

  const handleDelete = (idx: number) => {
    deleteMutation.mutate(idx);
    if (editIdx === idx) {
      setEditIdx(null);
      setForm({
        amount: "",
        category_name: categories[0]?.name || "",
        note: "",
      });
    }
  };

  const getCategoryColor = (name: string): string => {
    const category = categories.find((cat) => cat.name === name);
    return category?.color || "#000000";
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
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Số tiền
                </label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Số tiền"
                  className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Danh mục
                </label>
                <select
                  id="category"
                  name="category_name"
                  value={form.category_name}
                  onChange={handleChange}
                  className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
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
                placeholder="Ghi chú (tuỳ chọn)"
                className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    setForm({
                      amount: "",
                      category_name: categories[0]?.name || "",
                      note: "",
                    });
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
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <FileQuestion size={40} className="text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Chưa có khoản chi nào. Hãy thêm khoản chi mới!
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {transactions.map((tx, idx) => {
                const categoryColor = getCategoryColor(tx.category_name);
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4 relative"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: categoryColor,
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary dark:text-green-400 text-lg">
                          {tx.amount.toLocaleString()} đ
                        </span>
                        <div className="flex items-center mt-1">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <span className="text-sm font-medium dark:text-gray-200">
                            {tx.category_name}
                          </span>
                        </div>
                        {tx.note && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {tx.note}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 mt-2 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(tx.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-blue-500 border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/20"
                          onClick={() => handleEdit(idx)}
                          disabled={deleteMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Sửa</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(idx)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === idx ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Xóa</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
