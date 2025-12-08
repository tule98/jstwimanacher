"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Stack,
  Button,
  Switch,
  Typography,
} from "@mui/material";
import AppCurrencyInput from "@/components/ui/app-currency-input";
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
  renderActions?: (props: {
    isSubmitting: boolean;
    editTransaction: Transaction | null;
  }) => React.ReactNode;
  onFormReady?: (formElement: HTMLFormElement) => void;
}

export default function TransactionForm({
  onSubmit,
  onCancel,
  editTransaction = null,
  showTypeSelector = true,
  renderActions,
  onFormReady,
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
    <Stack spacing={3} sx={{ height: "100%" }}>
      {showTypeSelector && (
        <TransactionFormTabs
          activeType={activeType}
          onTypeChange={setActiveType}
          onFormReset={handleFormReset}
        />
      )}
      <Box
        component="form"
        onSubmit={handleSubmit(onFormSubmit)}
        ref={(formElement) => {
          if (formElement && onFormReady) {
            onFormReady(formElement as HTMLFormElement);
          }
        }}
        sx={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        <Stack spacing={3} sx={{ flex: 1, pb: 2 }}>
          <Box>
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

            <Box sx={{ mt: 1.5 }}>
              <DateNavigator
                currentDate={watchedCreatedAt}
                onDateChange={(date) => setValue("created_at", date)}
              />
            </Box>
          </Box>

          <Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box sx={{ flex: 1, position: "relative" }}>
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
                    setTimeout(() => {
                      setShowSuggestions(false);
                      autoSelectCategoryFromNote();
                    }, 160);
                  }}
                  placeholder="Enter description"
                  required
                />

                {showSuggestions &&
                  suggestions.length > 0 &&
                  !editTransaction && (
                    <TransactionFormDescriptionSuggestionPopover
                      showSuggestions={showSuggestions}
                      suggestions={suggestions}
                      onSuggestionSelect={handleSuggestionSelect}
                    />
                  )}
              </Box>

              <Box sx={{ flex: 1 }}>
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
              </Box>
            </Stack>
          </Box>

          <TransactionFormCategorySection
            categories={currentCategories}
            selectedCategoryId={watch("category_id")}
            transactionType={activeType}
            onCategorySelect={(categoryId) => {
              userSelectedCategoryRef.current = true;
              setValue("category_id", categoryId);
            }}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Buckets
            </Typography>
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
          </Box>

          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="subtitle2">Virtual Transaction</Typography>
                <Typography variant="body2" color="text.secondary">
                  Not counted in actual{" "}
                  {activeType === "income" ? "income" : "expenses"}
                </Typography>
              </Box>
              <Switch
                id="is_virtual"
                checked={watch("is_virtual")}
                onChange={(_, checked) => setValue("is_virtual", checked)}
                inputProps={{ "aria-label": "Virtual transaction" }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="subtitle2">Resolved</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mark as resolved or settled
                </Typography>
              </Box>
              <Switch
                id="is_resolved"
                checked={watch("is_resolved")}
                onChange={(_, checked) => setValue("is_resolved", checked)}
                inputProps={{ "aria-label": "Resolved transaction" }}
              />
            </Box>
          </Stack>
        </Stack>

        {!renderActions && (
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              pt: 2,
            }}
          >
            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              {onCancel && (
                <Button
                  type="button"
                  variant="outlined"
                  color="inherit"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  startIcon={<X size={16} />}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={
                  editTransaction ? <Save size={16} /> : <Plus size={16} />
                }
              >
                {editTransaction ? "Save Changes" : "Add Transaction"}
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
