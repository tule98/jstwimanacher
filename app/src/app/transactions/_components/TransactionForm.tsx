"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Save, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import {
  subDays,
  format,
  isEqual,
  parseISO,
  startOfDay,
  compareDesc,
} from "date-fns";
import {
  Category,
  Transaction,
  TransactionCreateData,
} from "@/services/api/client";

interface TransactionFormProps {
  categories: Category[];
  transactions: Transaction[];
  onSubmit: (data: TransactionCreateData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  editTransaction?: Transaction | null;
  showTypeSelector?: boolean;
}

export default function TransactionForm({
  categories,
  transactions,
  onSubmit,
  onCancel,
  isLoading = false,
  editTransaction = null,
  showTypeSelector = true,
}: TransactionFormProps) {
  // Separate income and expense categories
  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const [form, setForm] = useState({
    amount: "",
    category_id: "",
    note: "",
    created_at: format(new Date(), "yyyy-MM-dd'T'00:00"),
    is_virtual: false,
  });
  const [rawAmount, setRawAmount] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Transaction[]>([]);
  const [activeType, setActiveType] = useState<"income" | "expense">("expense");
  const noteInputRef = useRef<HTMLInputElement>(null);
  const datetimeInputRef = useRef<HTMLInputElement>(null);

  // Get current categories based on active type
  const currentCategories =
    activeType === "income" ? incomeCategories : expenseCategories;

  // Initialize form with edit data or default values
  useEffect(() => {
    if (editTransaction) {
      const amountStr = editTransaction.amount.toString();
      setRawAmount(amountStr);
      setActiveType(editTransaction.category.type || "expense");
      setForm({
        amount: Number(amountStr).toLocaleString("vi-VN"),
        category_id: editTransaction.category_id,
        note: editTransaction.note || "",
        created_at: format(
          parseISO(editTransaction.created_at),
          "yyyy-MM-dd'T'00:00"
        ),
        is_virtual: editTransaction.is_virtual || false,
      });
    } else if (currentCategories.length > 0 && form.category_id === "") {
      // For new transactions, set default category
      const defaultCategory =
        activeType === "expense"
          ? currentCategories.find((cat) => cat.name === "Ăn uống cá nhân")
          : null;
      setForm((prev) => ({
        ...prev,
        category_id: defaultCategory?.id || currentCategories[0]?.id || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTransaction, activeType, form.category_id]);

  // Update suggestions when note changes or on focus
  useEffect(() => {
    if (showSuggestions) {
      const yesterday = startOfDay(subDays(new Date(), 1));
      const yesterdayTransactions = transactions
        .filter((tx) => {
          const txDate = startOfDay(parseISO(tx.created_at));
          return (
            isEqual(txDate, yesterday) &&
            tx.note &&
            tx.note.trim() &&
            tx.category.type === activeType
          );
        })
        .sort((a, b) =>
          compareDesc(parseISO(a.created_at), parseISO(b.created_at))
        )
        .slice(0, 5);

      if (form.note.trim()) {
        const filteredSuggestions = yesterdayTransactions.filter(
          (tx) =>
            tx.note && tx.note.toLowerCase().includes(form.note.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
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
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name === "amount") {
      const numericValue = value.replace(/[^\d]/g, "");
      setRawAmount(numericValue);

      if (numericValue) {
        const formattedValue = Number(numericValue).toLocaleString("vi-VN");
        setForm({ ...form, amount: formattedValue });
      } else {
        setForm({ ...form, amount: "" });
      }
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSuggestionSelect = (transaction: Transaction) => {
    const amountStr = transaction.amount.toString();
    setRawAmount(amountStr);
    setForm((prev) => ({
      ...prev,
      note: transaction.note || "",
      amount: Number(amountStr).toLocaleString("vi-VN"),
      category_id: transaction.category_id,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createData: TransactionCreateData = {
      amount: Number(rawAmount),
      category_id: form.category_id,
      note: form.note,
      created_at: form.created_at,
      is_virtual: form.is_virtual,
    };

    onSubmit(createData);

    // Reset form if not editing
    if (!editTransaction) {
      const currentCreatedAt = form.created_at;
      const defaultCategory =
        activeType === "expense"
          ? currentCategories.find((cat) => cat.name === "Ăn uống cá nhân")
          : null;
      setForm({
        amount: "",
        category_id: defaultCategory?.id || currentCategories[0]?.id || "",
        note: "",
        created_at: currentCreatedAt,
        is_virtual: false,
      });
      setRawAmount("");
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Transaction Type Selector */}
      {showTypeSelector && (
        <div>
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
                  ? newCategories.find((cat) => cat.name === "Ăn uống cá nhân")
                  : null;
              setForm({
                amount: "",
                category_id: defaultCategory?.id || newCategories[0]?.id || "",
                note: "",
                created_at: currentCreatedAt,
                is_virtual: false,
              });
              setRawAmount("");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="flex items-center gap-2">
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
      )}

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
                if (!editTransaction) {
                  const yesterday = startOfDay(subDays(new Date(), 1));
                  const yesterdayTransactions = transactions
                    .filter((tx) => {
                      const txDate = startOfDay(parseISO(tx.created_at));
                      return (
                        isEqual(txDate, yesterday) &&
                        tx.note &&
                        tx.note.trim() &&
                        tx.category.type === activeType
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
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              placeholder="Nhập ghi chú"
              className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && !editTransaction && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, idx) => {
                  const categoryColor =
                    categories.find((cat) => cat.id === suggestion.category_id)
                      ?.color || "#000000";
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
                            {categories.find(
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
          {currentCategories.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
              Chưa có danh mục{" "}
              {activeType === "income" ? "thu nhập" : "chi tiêu"} nào. Hãy thêm
              danh mục trong{" "}
              <a href="/categories" className="text-blue-500 hover:underline">
                trang quản lý danh mục
              </a>
              .
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {currentCategories.map((cat) => {
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

        {/* Virtual Transaction Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="is_virtual"
            type="checkbox"
            name="is_virtual"
            checked={form.is_virtual}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="is_virtual"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Giao dịch ảo
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              (Không tính vào{" "}
              {activeType === "income"
                ? "thu nhập thực tế"
                : "chi tiêu thực tế"}
              )
            </span>
          </label>
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
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
              </>
            ) : editTransaction ? (
              <>
                <Save className="mr-2 h-4 w-4" /> Cập nhật
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Thêm mới
              </>
            )}
          </Button>

          {(editTransaction || onCancel) && (
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={onCancel}
            >
              <X className="mr-2 h-4 w-4" /> Huỷ
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
