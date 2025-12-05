"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Autocomplete, TextField, Chip } from "@mui/material";
import AppCurrencyInput from "@/components/ui/app-currency-input";
import AppButton from "@/components/ui/app-button";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Save } from "lucide-react";
import TransactionFormTabs from "./TransactionFormTabs";
import TransactionFormCategorySection from "./TransactionFormCategorySection";
import { useBuckets } from "@/services/react-query/queries";
import DateNavigator from "./DateNavigator";
import { toast } from "sonner";
import {
  format,
  isEqual,
  parseISO,
  startOfDay,
  compareDesc,
  subDays,
} from "date-fns";
import { Transaction, TransactionCreateData } from "@/services/api/client";
import { useCategories, useTransactions } from "@/services/react-query/queries";
import TransactionFormDescriptionSuggestionPopover from "./TransactionFormDescriptionSuggestionPopover";

// Validation schema
const transactionFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  category_id: z.string().min(1, "Category is required"),
  note: z.string().min(1, "Description is required"),
  created_at: z.string().min(1, "Time is required"),
  is_virtual: z.boolean(),
  is_resolved: z.boolean(),
  bucket_ids: z.array(z.string()).default([]),
});

type TransactionFormInput = z.input<typeof transactionFormSchema>;

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
  const { data: buckets } = useBuckets();
  const defaultBucket = buckets?.find((b) => b.is_default);
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
  const userSelectedCategoryRef = useRef(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: "",
      category_id: "",
      note: "",
      created_at: format(new Date(), "yyyy-MM-dd"),
      is_virtual: false,
      is_resolved: true,
      bucket_ids: [],
    },
  });

  const watchedCreatedAt = watch("created_at");
  const watchedNote = watch("note");
  const watchedCategoryId = watch("category_id");
  const watchedBucketIds = watch("bucket_ids") || [];

  const createdAtField = register("created_at");
  const noteField = register("note");

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
        format(parseISO(editTransaction.created_at), "yyyy-MM-dd")
      );
      setValue("is_virtual", editTransaction.is_virtual || false);
      setValue("is_resolved", editTransaction.is_resolved ?? true);
      // Initialize bucket_ids from available buckets relations if present
      const existingBucketIds = editTransaction.buckets?.map((b) => b.id) || [];
      setValue("bucket_ids", existingBucketIds);
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
  }, [editTransaction, activeType, setValue]);

  // When creating a new transaction (not editing), auto-select the default bucket if available
  useEffect(() => {
    if (!editTransaction && buckets && buckets.length > 0) {
      const def = buckets.find((b) => b.is_default);
      if (def) {
        const current = (watch("bucket_ids") as string[] | undefined) || [];
        if (!current || current.length === 0)
          setValue("bucket_ids", [def.id], { shouldDirty: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets, editTransaction, setValue]);

  // Update suggestions when note changes or on focus
  useEffect(() => {
    if (showSuggestions) {
      if (watchedNote?.trim()) {
        const filteredSuggestions = transactions.filter(
          (tx) =>
            tx.note && tx.note.toLowerCase().includes(watchedNote.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions(transactions);
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
    userSelectedCategoryRef.current = true; // treat selecting a suggestion as a manual category choice
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
      is_resolved: true,
      bucket_ids: defaultBucket ? [defaultBucket.id] : [],
    });
    setRawAmount("");
    userSelectedCategoryRef.current = false;
  };

  const onFormSubmit = (data: TransactionFormInput) => {
    const createData: TransactionCreateData = {
      amount: Number(rawAmount),
      category_id: data.category_id,
      bucket_ids: data.bucket_ids,
      note: data.note,
      created_at: data.created_at,
      is_virtual: data.is_virtual,
      is_resolved: data.is_resolved,
    };

    onSubmit(createData);

    // Show success toast
    if (editTransaction) {
      toast.success("Transaction updated successfully!");
    } else {
      toast.success("Transaction added successfully!", {
        description: `${data.note} - ${Number(rawAmount).toLocaleString(
          "vi-VN"
        )} ₫`,
      });
    }

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
        is_resolved: true,
        bucket_ids: defaultBucket ? [defaultBucket.id] : [],
      });
      setRawAmount("");

      // Auto-focus on note field after form submission
      setTimeout(() => {
        setFocus("note");
      }, 0);

      // Allow auto-selection logic to run again on fresh form
      userSelectedCategoryRef.current = false;
    }
  };

  // Normalize helper: lowercase and strip diacritics for robust matching
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "")
      .trim();

  // Run category auto-selection only on blur (not on each keystroke)
  const autoSelectCategoryFromNote = () => {
    const note = (watch("note") || "").trim();
    if (!note) return;

    const normalizedNote = normalize(note);
    const candidates = currentCategories || [];
    if (!candidates.length) return;

    let bestMatchId: string | null = null;
    let bestMatchLength = -1;

    for (const cat of candidates) {
      const nameNorm = normalize(cat.name);
      if (nameNorm && normalizedNote.includes(nameNorm)) {
        if (nameNorm.length > bestMatchLength) {
          bestMatchLength = nameNorm.length;
          bestMatchId = cat.id;
        }
      }
    }

    if (bestMatchId) {
      const current = watch("category_id");
      if (!current || userSelectedCategoryRef.current === false) {
        setValue("category_id", bestMatchId);
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Transaction Type Selector */}
      {showTypeSelector && (
        <TransactionFormTabs
          activeType={activeType}
          onTypeChange={setActiveType}
          onFormReset={handleFormReset}
        />
      )}

      <form
        className="flex flex-col flex-1"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <div className="flex-1 space-y-3 pb-4">
          {/* Date Input - First Field */}
          <div className="flex flex-col gap-2">
            <TextField
              id="created_at"
              type="date"
              fullWidth
              label="Date"
              value={watchedCreatedAt || ""}
              onChange={(event) => {
                createdAtField.onChange(event);
              }}
              onBlur={(event) => {
                createdAtField.onBlur(event);
              }}
              name={createdAtField.name}
              inputRef={createdAtField.ref}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Date Navigator */}
            <DateNavigator
              currentDate={watchedCreatedAt}
              onDateChange={(date) => setValue("created_at", date)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2 relative">
              <TextField
                id="note"
                label="Transaction description"
                fullWidth
                value={watchedNote || ""}
                name={noteField.name}
                inputRef={noteField.ref}
                onChange={(event) => {
                  noteField.onChange(event);
                }}
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
                onBlur={(event) => {
                  noteField.onBlur(event);
                  // Delay to allow suggestion click to register before hiding and auto-selecting
                  setTimeout(() => {
                    setShowSuggestions(false);
                    autoSelectCategoryFromNote();
                  }, 160);
                }}
                placeholder="Enter description"
                required
              />

              {/* Suggestions dropdown */}
              {showSuggestions &&
                suggestions.length > 0 &&
                !editTransaction && (
                  <TransactionFormDescriptionSuggestionPopover
                    showSuggestions={showSuggestions}
                    suggestions={suggestions}
                    onSuggestionSelect={handleSuggestionSelect}
                  />
                )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Amount
              </label>
              <AppCurrencyInput
                id="amount"
                value={watch("amount")}
                onChange={(formattedValue, rawValue) => {
                  setRawAmount(rawValue);
                  setValue("amount", formattedValue);
                }}
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          <TransactionFormCategorySection
            categories={currentCategories}
            selectedCategoryId={watch("category_id")}
            transactionType={activeType}
            onCategorySelect={(categoryId) => {
              userSelectedCategoryRef.current = true; // mark as manual selection
              setValue("category_id", categoryId);
            }}
          />

          {/* Bucket selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Buckets
            </label>
            <Autocomplete
              multiple
              options={buckets || []}
              disableCloseOnSelect
              getOptionLabel={(option) => option.name}
              value={(buckets || []).filter((b) =>
                watchedBucketIds.includes(b.id)
              )}
              onChange={(_, value) =>
                setValue(
                  "bucket_ids",
                  value.map((v) => v.id),
                  { shouldDirty: true }
                )
              }
              renderValue={(selected, getValueProps) =>
                selected.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.name}
                    {...getValueProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    defaultBucket ? defaultBucket.name : "Select buckets"
                  }
                />
              )}
            />
          </div>

          {/* Virtual Transaction Switch */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <label
                htmlFor="is_virtual"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Virtual Transaction
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Not counted in actual{" "}
                {activeType === "income" ? "income" : "expenses"}
              </p>
            </div>
            <Switch
              id="is_virtual"
              checked={watch("is_virtual")}
              onCheckedChange={(checked) => setValue("is_virtual", checked)}
            />
          </div>

          {/* Resolved Transaction Switch */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <label
                htmlFor="is_resolved"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Resolved
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Mark as resolved or settled
              </p>
            </div>
            <Switch
              id="is_resolved"
              checked={watch("is_resolved")}
              onCheckedChange={(checked) => setValue("is_resolved", checked)}
            />
          </div>
        </div>

        {/* Sticky Submit and Cancel buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t pt-4 -mx-6 px-6 -mb-4 pb-4">
          <div className="flex items-center justify-end gap-3">
            {onCancel && (
              <AppButton
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </AppButton>
            )}

            <AppButton type="submit" loading={isSubmitting}>
              {editTransaction ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </>
              )}
            </AppButton>
          </div>
        </div>
      </form>
    </div>
  );
}
