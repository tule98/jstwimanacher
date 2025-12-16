import React, { useState } from "react";
import { AppHighlightBlock } from "@/components/ui/app-highlight-block";
import { AppBlock } from "@/components/ui/app-block";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { BalanceStats } from "@/services/api/client";
import { formatCurrency } from "@/lib/utils";

interface TransactionStatsCardsViewProps {
  balanceStats: BalanceStats | undefined;
  currentMonth: number;
  currentYear: number;
}

export default function TransactionStatsSections({
  balanceStats,
  currentMonth,
  currentYear,
}: TransactionStatsCardsViewProps) {
  const [hideBalance, setHideBalance] = useState(false);
  return (
    <AppHighlightBlock
      title={`Số dư ${currentMonth}/${currentYear}`}
      description="Tổng quan tài chính tháng này"
      icon={Wallet}
      variant="success"
      size="lg"
      footer={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHideBalance(!hideBalance)}
          className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 ml-auto"
        >
          {hideBalance ? <Eye size={16} /> : <EyeOff size={16} />}
        </Button>
      }
    >
      {balanceStats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thu nhập */}
          <AppBlock
            title="Thu nhập"
            value={
              hideBalance ? "•••••••" : formatCurrency(balanceStats.income)
            }
            variant="success"
            icon={<TrendingUp className="w-4 h-4" />}
          />

          {/* Chi tiêu */}
          <AppBlock
            title="Chi tiêu"
            value={
              hideBalance ? "•••••••" : formatCurrency(balanceStats.expense)
            }
            variant="error"
            icon={<TrendingDown className="w-4 h-4" />}
          />

          {/* Số dư */}
          <AppBlock
            title="Số dư"
            value={
              hideBalance ? (
                "•••••••"
              ) : (
                <>
                  {balanceStats.income - balanceStats.expense >= 0 ? "+" : ""}
                  {formatCurrency(balanceStats.income - balanceStats.expense)}
                </>
              )
            }
            variant="info"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-20">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Đang tải thông tin số dư...
          </p>
        </div>
      )}
    </AppHighlightBlock>
  );
}
