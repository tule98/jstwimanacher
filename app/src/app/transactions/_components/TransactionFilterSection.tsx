"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter, Wallet } from "lucide-react";
import {
  useCategories,
  useBuckets,
  useBucketBalance,
} from "@/services/react-query/queries";

interface TransactionFilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onlyUnresolved: boolean;
  onOnlyUnresolvedChange: (value: boolean) => void;
  onlyVirtual: boolean;
  onOnlyVirtualChange: (value: boolean) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
  selectedBucketId?: string;
  onBucketChange?: (value?: string) => void;
}

export default function TransactionFilterSection({
  searchQuery,
  onSearchChange,
  onlyUnresolved,
  onOnlyUnresolvedChange,
  onlyVirtual,
  onOnlyVirtualChange,
  selectedCategoryId,
  onCategoryChange,
  selectedBucketId,
  onBucketChange,
}: TransactionFilterSectionProps) {
  const { data: categories = [] } = useCategories();
  const { data: buckets = [] } = useBuckets();
  const { data: bucketBalance } = useBucketBalance(selectedBucketId);

  const hasActiveFilters =
    onlyUnresolved || onlyVirtual || selectedCategoryId !== "all";

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search transactions by note..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Active
            </span>
          )}
        </div>

        {/* Category Filter */}
        {/* Bucket Filter */}
        <div className="space-y-2">
          <Label htmlFor="bucket-filter" className="text-sm font-medium">
            Bucket
          </Label>
          <Select
            value={selectedBucketId || "all"}
            onValueChange={(v) =>
              onBucketChange && onBucketChange(v === "all" ? undefined : v)
            }
          >
            <SelectTrigger id="bucket-filter">
              <SelectValue placeholder="All buckets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buckets</SelectItem>
              {buckets.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bucket Balance Display */}
          {selectedBucketId && bucketBalance && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Bucket Balance
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Income
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {bucketBalance.income.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Expense
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {bucketBalance.expense.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="pt-1.5 mt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Net
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        bucketBalance.income - bucketBalance.expense >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {(
                        bucketBalance.income - bucketBalance.expense
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select value={selectedCategoryId} onValueChange={onCategoryChange}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem
                value="income"
                className="font-semibold text-green-600 dark:text-green-400"
              >
                --- Income ---
              </SelectItem>
              {categories
                .filter((cat) => cat.type === "income")
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              <SelectItem
                value="expense"
                className="font-semibold text-red-600 dark:text-red-400"
              >
                --- Expense ---
              </SelectItem>
              {categories
                .filter((cat) => cat.type === "expense")
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Filters */}
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="only-unresolved"
              className="text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <span>Only show unresolved transactions</span>
              {onlyUnresolved && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                  Active
                </span>
              )}
            </Label>
            <Switch
              id="only-unresolved"
              checked={onlyUnresolved}
              onCheckedChange={onOnlyUnresolvedChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="only-virtual"
              className="text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <span>Only show virtual transactions</span>
              {onlyVirtual && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                  Active
                </span>
              )}
            </Label>
            <Switch
              id="only-virtual"
              checked={onlyVirtual}
              onCheckedChange={onOnlyVirtualChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
