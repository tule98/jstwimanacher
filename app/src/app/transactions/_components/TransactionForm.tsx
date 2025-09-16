"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AppCurrencyInput from "@/components/ui/app-currency-input";
import AppButton from "@/components/ui/app-button";
import { Plus, X, Save } from "lucide-react";
import TransactionFormTabs from "./TransactionFormTabs";
import {
  subDays,
  format,
  isEqual,
  parseISO,
  startOfDay,
  compareDesc,
} from "date-fns";
import { Transaction, TransactionCreateData } from "@/services/api/client";
import { useCategories, useTransactions } from "@/services/react-query/queries";

// Validation schema
const transactionFormSchema = z.object({
  amount: z.string().min(1, "Số tiền là bắt buộc"),
  category_id: z.string().min(1, "Danh mục là bắt buộc"),
  note: z.string().min(1, "Ghi chú là bắt buộc"),
  created_at: z.string().min(1, "Thời gian là bắt buộc"),
  is_virtual: z.boolean(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionCreateData) => void;
  onCancel?: () => void;
  editTransaction?: Transaction | null;
  showTypeSelector?: boolean;
}

export default function TransactionForm({
  onSubmit,
  onCancel,
  editTransaction = null,
  showTypeSelector = true,
}: TransactionFormProps) {
  // Separate income and expense categories
  const { data: categories } = useCategories();
  const { data: _transactions } = useTransactions();
  const transactions = _transactions?.pages.flat() || [];
  const incomeCategories = (categories || []).filter(
    (cat) => cat.type === "income"
  );
  const expenseCategories = (categories || []).filter(
    (cat) => cat.type === "expense"
  );

  const [rawAmount, setRawAmount] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Transaction[]>([]);
  const [activeType, setActiveType] = useState<"income" | "expense">("expense");

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: "",
      category_id: "",
      note: "",
      created_at: format(new Date(), "yyyy-MM-dd'T'00:00"),
      is_virtual: false,
    },
  });

  const watchedNote = watch("note");
  const watchedCategoryId = watch("category_id");

  // Get current categories based on active type
  const currentCategories =
    activeType === "income" ? incomeCategories : expenseCategories;

  // Initialize form with edit data or default values
  useEffect(() => {
    if (editTransaction) {
      const amountStr = editTransaction.amount.toString();
      setRawAmount(amountStr);
      setActiveType(editTransaction.category.type || "expense");
      setValue("amount", Number(amountStr).toLocaleString("vi-VN"));
      setValue("category_id", editTransaction.category_id);
      setValue("note", editTransaction.note || "");
      setValue(
        "created_at",
        format(parseISO(editTransaction.created_at), "yyyy-MM-dd'T'00:00")
      );
      setValue("is_virtual", editTransaction.is_virtual || false);
    } else if (currentCategories.length > 0 && !watchedCategoryId) {
      // For new transactions, set default category
      const defaultCategory =
        activeType === "expense"
          ? currentCategories.find((cat) => cat.name === "Ăn uống cá nhân")
          : null;
      setValue(
        "category_id",
        defaultCategory?.id || currentCategories[0]?.id || ""
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTransaction, activeType, watchedCategoryId, setValue]);

  // Update suggestions when note changes or on focus
  useEffect(() => {
    if (showSuggestions) {
      const yesterday = startOfDay(subDays(new Date(), 1));
      const yesterdayTransactions = (transactions || [])
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

      if (watchedNote?.trim()) {
        const filteredSuggestions = yesterdayTransactions.filter(
          (tx) =>
            tx.note && tx.note.toLowerCase().includes(watchedNote.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions(yesterdayTransactions);
      }
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedNote, showSuggestions, activeType]);

  const handleSuggestionSelect = (transaction: Transaction) => {
    const amountStr = transaction.amount.toString();
    setRawAmount(amountStr);
    setValue("note", transaction.note || "");
    setValue("amount", Number(amountStr).toLocaleString("vi-VN"));
    setValue("category_id", transaction.category_id);
    setShowSuggestions(false);
  };

  const handleFormReset = (newType: "income" | "expense") => {
    // Reset form when changing type
    const currentCreatedAt = watch("created_at");
    const newCategories =
      newType === "income" ? incomeCategories : expenseCategories;
    const defaultCategory =
      newType === "expense"
        ? newCategories.find((cat) => cat.name === "Ăn uống cá nhân")
        : null;

    reset({
      amount: "",
      category_id: defaultCategory?.id || newCategories[0]?.id || "",
      note: "",
      created_at: currentCreatedAt,
      is_virtual: false,
    });
    setRawAmount("");
  };

  const onFormSubmit = (data: TransactionFormData) => {
    const createData: TransactionCreateData = {
      amount: Number(rawAmount),
      category_id: data.category_id,
      note: data.note,
      created_at: data.created_at,
      is_virtual: data.is_virtual,
    };

    onSubmit(createData);

    // Reset form if not editing
    if (!editTransaction) {
      const currentCreatedAt = data.created_at;
      const defaultCategory =
        activeType === "expense"
          ? currentCategories.find((cat) => cat.name === "Ăn uống cá nhân")
          : null;

      reset({
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
        <TransactionFormTabs
          activeType={activeType}
          onTypeChange={setActiveType}
          onFormReset={handleFormReset}
        />
      )}

      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 relative">
            <label
              htmlFor="note"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Mô tả giao dịch
            </label>
            <input
              id="note"
              type="text"
              {...register("note")}
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
                    (categories || []).find(
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
                            {(categories || []).find(
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
            <AppCurrencyInput
              id="amount"
              value={watch("amount")}
              onChange={(formattedValue, rawValue) => {
                setRawAmount(rawValue);
                setValue("amount", formattedValue);
              }}
              placeholder="Nhập số tiền"
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
                const isSelected = watch("category_id") === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setValue("category_id", cat.id);
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
            {...register("is_virtual")}
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
            id="created_at"
            type="datetime-local"
            {...register("created_at")}
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
                setValue(
                  "created_at",
                  format(twoDaysAgo, "yyyy-MM-dd'T'00:00")
                );
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
                setValue("created_at", format(yesterday, "yyyy-MM-dd'T'00:00"));
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
                setValue("created_at", format(today, "yyyy-MM-dd'T'00:00"));
              }}
              className="px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 transition-colors"
            >
              Hôm nay
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <AppButton type="submit" loading={isSubmitting} size="md">
            {editTransaction ? (
              <>
                <Save className="mr-2 h-4 w-4" /> Cập nhật
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Thêm mới
              </>
            )}
          </AppButton>

          {(editTransaction || onCancel) && (
            <AppButton
              type="button"
              variant="outline"
              size="md"
              onClick={onCancel}
            >
              <X className="mr-2 h-4 w-4" /> Huỷ
            </AppButton>
          )}
        </div>
      </form>
    </div>
  );
}
