import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCategories } from "@/services/react-query/queries";
import AppTabs from "@/components/ui/app-tabs";

interface TransactionFormTabsProps {
  activeType: "income" | "expense";
  onTypeChange: (type: "income" | "expense") => void;
  onFormReset: (newType: "income" | "expense") => void;
}

export default function TransactionFormTabs({
  activeType,
  onTypeChange,
  onFormReset,
}: TransactionFormTabsProps) {
  const { data: categories } = useCategories();

  const incomeCategories = (categories || []).filter(
    (cat) => cat.type === "income"
  );
  const expenseCategories = (categories || []).filter(
    (cat) => cat.type === "expense"
  );

  const handleTypeChange = (value: string) => {
    const newType = value as "income" | "expense";
    onTypeChange(newType);
    onFormReset(newType);
  };

  return (
    <div>
      <AppTabs
        value={activeType}
        onValueChange={handleTypeChange}
        className="w-full"
      >
        <AppTabs.List className="grid w-full grid-cols-2">
          <AppTabs.Trigger value="expense" className="flex items-center gap-2">
            <TrendingDown size={16} />
            Chi tiêu ({expenseCategories.length} danh mục)
          </AppTabs.Trigger>
          <AppTabs.Trigger value="income" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Thu nhập ({incomeCategories.length} danh mục)
          </AppTabs.Trigger>
        </AppTabs.List>
      </AppTabs>
    </div>
  );
}
