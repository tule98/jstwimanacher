"use client";
import * as React from "react";
import { Box, Stack, Typography, Divider } from "@mui/material";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useBucketBalance } from "@/services/react-query/queries";

interface BucketBalanceStatsBoxProps {
  bucketId: string;
}

export default function BucketBalanceStatsBox({
  bucketId,
}: BucketBalanceStatsBoxProps) {
  const { data: balance, isLoading } = useBucketBalance(bucketId);

  if (isLoading || !balance) {
    return null;
  }

  const net = balance.income - balance.expense;

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Stack spacing={2}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          Bucket Balance
        </Typography>

        <Divider />

        {/* Income */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingUp size={18} color="#4caf50" />
            <Typography variant="body2" sx={{ color: "success.main" }}>
              Income
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: "success.main" }}
          >
            {balance.income.toLocaleString("vi-VN")} ₫
          </Typography>
        </Stack>

        {/* Expense */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingDown size={18} color="#f44336" />
            <Typography variant="body2" sx={{ color: "error.main" }}>
              Expense
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: "error.main" }}
          >
            {balance.expense.toLocaleString("vi-VN")} ₫
          </Typography>
        </Stack>

        <Divider />

        {/* Net */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Wallet size={18} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Net Balance
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: net >= 0 ? "success.main" : "error.main",
            }}
          >
            {net.toLocaleString("vi-VN")} ₫
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
