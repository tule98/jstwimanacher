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
import { Search, X, Filter } from "lucide-react";
import { useCategories } from "@/services/react-query/queries";

interface TransactionFilterSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onlyUnresolved: boolean;
  onOnlyUnresolvedChange: (value: boolean) => void;
  onlyVirtual: boolean;
  onOnlyVirtualChange: (value: boolean) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
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
}: TransactionFilterSectionProps) {
  const { data: categories = [] } = useCategories();

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
