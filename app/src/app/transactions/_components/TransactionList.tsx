import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  Stack,
} from "@mui/material";
import {
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { Transaction } from "@/services/api/client";
import { useCategories } from "@/services/react-query/queries";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onToggleVirtual?: (id: string) => void;
  isDeleting: boolean;
  deletingId?: string;
  isTogglingResolved: boolean;
  togglingId?: string;
  isTogglingVirtual?: boolean;
  togglingVirtualId?: string;
}

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Group transactions by day
const groupTransactionsByDay = (transactions: Transaction[]) => {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((tx) => {
    const date = parseISO(tx.created_at);
    const dateKey = format(date, "yyyy-MM-dd");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });

  // Sort groups by date (newest first) and sort transactions within each group by time (newest first)
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, txs]) => ({
      date: parseISO(dateKey),
      transactions: txs.sort(
        (a, b) =>
          parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
      ),
    }));
};

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onToggleResolved,
  onToggleVirtual,
  isDeleting,
  deletingId,
  isTogglingResolved,
  togglingId,
  isTogglingVirtual,
  togglingVirtualId,
}: TransactionListProps) {
  const { data: categories = [] } = useCategories();
  const theme = useTheme();

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "#000000";
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };
  // TODO: Render bucket chips alongside transactions when bucket data is included in API payloads.

  const getCategoryType = (categoryId: string): "income" | "expense" => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.type || "expense";
  };

  const groupedTransactions = groupTransactionsByDay(transactions);

  if (transactions.length === 0) {
    return (
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 128,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "grey.50",
          p: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Chưa có giao dịch nào. Hãy thêm giao dịch mới!
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {groupedTransactions.map(({ date, transactions: dayTransactions }) => {
        const isToday = isSameDay(date, new Date());
        const isYesterday = isSameDay(
          date,
          new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        let dateLabel = format(date, "dd/MM/yyyy - EEEE", {
          locale: undefined,
        });
        if (isToday) {
          dateLabel = "Hôm nay - " + format(date, "dd/MM/yyyy");
        } else if (isYesterday) {
          dateLabel = "Hôm qua - " + format(date, "dd/MM/yyyy");
        }

        // Calculate daily total (income - expense)
        const dailyIncome = dayTransactions
          .filter((tx) => tx.category.type === "income")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const dailyExpense = dayTransactions
          .filter((tx) => tx.category.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);
        const dailyBalance = dailyIncome - dailyExpense;

        return (
          <Box key={format(date, "yyyy-MM-dd")}>
            {/* Date Header */}
            <Box
              sx={{
                py: 1,
                borderBottom: 1,
                borderColor: "divider",
                mb: 1,
              }}
            >
              {/* Desktop: All in one line */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                >
                  {dateLabel}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Show unresolved count for this day */}
                  {dayTransactions.some((tx) => tx.is_resolved === false) && (
                    <Chip
                      label={`${
                        dayTransactions.filter((tx) => tx.is_resolved === false)
                          .length
                      } cần xem xét`}
                      size="small"
                      sx={{
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(234, 179, 8, 0.2)"
                            : "warning.light",
                        color:
                          theme.palette.mode === "dark"
                            ? "warning.light"
                            : "warning.dark",
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {dailyIncome > 0 && (
                      <Chip
                        icon={<TrendingUp size={14} />}
                        label={formatCurrency(dailyIncome)}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {dailyExpense > 0 && (
                      <Chip
                        icon={<TrendingDown size={14} />}
                        label={formatCurrency(dailyExpense)}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {dailyIncome > 0 && dailyExpense > 0 && (
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          dailyBalance >= 0 ? "success.main" : "error.main"
                        }
                      >
                        (={formatCurrency(Math.abs(dailyBalance))})
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Box>

              {/* Mobile: Split into 2 lines */}
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                {/* First line: Date + unresolved count */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="text.secondary"
                  >
                    {dateLabel}
                  </Typography>
                  {dayTransactions.some((tx) => tx.is_resolved === false) && (
                    <Chip
                      label={`${
                        dayTransactions.filter((tx) => tx.is_resolved === false)
                          .length
                      } cần xem xét`}
                      size="small"
                      sx={{
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(234, 179, 8, 0.2)"
                            : "warning.light",
                        color:
                          theme.palette.mode === "dark"
                            ? "warning.light"
                            : "warning.dark",
                        fontSize: "0.75rem",
                      }}
                    />
                  )}
                </Stack>

                {/* Second line: Financial summary */}
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  {dailyIncome > 0 && (
                    <Chip
                      icon={<TrendingUp size={14} />}
                      label={formatCurrency(dailyIncome)}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {dailyExpense > 0 && (
                    <Chip
                      icon={<TrendingDown size={14} />}
                      label={formatCurrency(dailyExpense)}
                      size="small"
                      color="error"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {dailyIncome > 0 && dailyExpense > 0 && (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={dailyBalance >= 0 ? "success.main" : "error.main"}
                    >
                      (={formatCurrency(Math.abs(dailyBalance))})
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Unified list layout for all viewports */}
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <Box sx={{ bgcolor: "background.paper" }}>
                {dayTransactions.map((tx, index) => {
                  const categoryColor = getCategoryColor(tx.category_id);
                  const categoryName = getCategoryName(tx.category_id);
                  const transactionType =
                    tx.category.type || getCategoryType(tx.category_id);
                  const isResolved = tx.is_resolved !== false;
                  const isUnresolved = !isResolved;

                  return (
                    <Box
                      key={tx.id}
                      sx={{
                        p: 2,
                        borderBottom:
                          index < dayTransactions.length - 1 ? 1 : 0,
                        borderColor: "divider",
                        bgcolor: isUnresolved
                          ? theme.palette.mode === "dark"
                            ? "rgba(234, 179, 8, 0.1)"
                            : "rgba(254, 252, 232, 1)"
                          : "transparent",
                        "&:hover": {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "grey.50",
                        },
                      }}
                    >
                      {/* Row: Status, Note, Amount */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ mb: 1 }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: categoryColor,
                              flexShrink: 0,
                            }}
                          />
                          {isUnresolved && (
                            <AlertCircle
                              size={16}
                              color="currentColor"
                              style={{
                                color: "var(--mui-palette-warning-main)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tx.note || "Không có ghi chú"}
                          </Typography>
                          {tx.is_virtual && (
                            <Chip
                              label="Ảo"
                              size="small"
                              sx={{
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(168, 85, 247, 0.2)"
                                    : "rgba(243, 232, 255, 1)",
                                color:
                                  theme.palette.mode === "dark"
                                    ? "rgba(216, 180, 254, 1)"
                                    : "rgba(126, 34, 206, 1)",
                                fontSize: "0.65rem",
                                height: 18,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Stack>
                        <Chip
                          variant="outlined"
                          label={formatCurrency(tx.amount)}
                          color={
                            transactionType === "income" ? "success" : "error"
                          }
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            flexShrink: 0,
                          }}
                        />
                      </Stack>

                      {/* Row: Category + Type, Actions */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            variant="outlined"
                            icon={
                              transactionType === "income" ? (
                                <TrendingUp size={12} />
                              ) : (
                                <TrendingDown size={12} />
                              )
                            }
                            label={transactionType === "income" ? "Thu" : "Chi"}
                            size="small"
                            color={
                              transactionType === "income" ? "success" : "error"
                            }
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {categoryName}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => onToggleResolved(tx.id)}
                            disabled={isDeleting || isTogglingResolved}
                            title={
                              isResolved
                                ? "Đánh dấu cần xem xét lại"
                                : "Đánh dấu đã xác nhận"
                            }
                            sx={{
                              color: isResolved
                                ? "success.main"
                                : "warning.main",
                              "&:hover": {
                                bgcolor: isResolved
                                  ? theme.palette.mode === "dark"
                                    ? "rgba(34, 197, 94, 0.2)"
                                    : "rgba(220, 252, 231, 1)"
                                  : theme.palette.mode === "dark"
                                  ? "rgba(234, 179, 8, 0.2)"
                                  : "rgba(254, 252, 232, 1)",
                              },
                            }}
                          >
                            {isTogglingResolved && togglingId === tx.id ? (
                              <CircularProgress size={16} />
                            ) : isResolved ? (
                              <CheckCircle size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                          </IconButton>
                          {onToggleVirtual && (
                            <IconButton
                              size="small"
                              onClick={() => onToggleVirtual(tx.id)}
                              disabled={
                                isDeleting ||
                                isTogglingResolved ||
                                isTogglingVirtual
                              }
                              title={
                                tx.is_virtual
                                  ? "Chuyển thành giao dịch thực tế"
                                  : "Đánh dấu là giao dịch ảo"
                              }
                              sx={{
                                color: tx.is_virtual
                                  ? "secondary.main"
                                  : "text.disabled",
                                "&:hover": {
                                  bgcolor: tx.is_virtual
                                    ? theme.palette.mode === "dark"
                                      ? "rgba(168, 85, 247, 0.2)"
                                      : "rgba(243, 232, 255, 1)"
                                    : theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.05)"
                                    : "grey.100",
                                },
                              }}
                            >
                              {isTogglingVirtual &&
                              togglingVirtualId === tx.id ? (
                                <CircularProgress size={16} />
                              ) : tx.is_virtual ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => onEdit(tx)}
                            disabled={isDeleting || isTogglingResolved}
                            sx={{
                              color: "info.main",
                              "&:hover": {
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(59, 130, 246, 0.2)"
                                    : "rgba(219, 234, 254, 1)",
                              },
                            }}
                          >
                            <Edit size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(tx.id)}
                            disabled={isDeleting || isTogglingResolved}
                            sx={{
                              color: "error.main",
                              "&:hover": {
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(254, 226, 226, 1)",
                              },
                            }}
                          >
                            {isDeleting && deletingId === tx.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        );
      })}
    </Stack>
  );
}
