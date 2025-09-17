"use client";
import React from "react";
import AppButton from "@/components/ui/app-button";
import { Transaction } from "@/services/api/client";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionFormDescriptionSuggestionPopoverProps {
  showSuggestions: boolean;
  suggestions: Transaction[];
  onSuggestionSelect: (transaction: Transaction) => void;
}

export default function TransactionFormDescriptionSuggestionPopover({
  showSuggestions,
  suggestions,
  onSuggestionSelect,
}: TransactionFormDescriptionSuggestionPopoverProps) {
  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      {suggestions.map((suggestion, idx) => {
        return (
          <AppButton
            key={idx}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSuggestionSelect(suggestion)}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 justify-start h-auto"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-gray-900 dark:text-gray-100 truncate flex-1">
                {suggestion.note}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400 ml-2 whitespace-nowrap">
                {formatCurrency(suggestion.amount)}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 ml-2">
                  {formatDate(suggestion.created_at)}
                </span>
              </div>
            </div>
          </AppButton>
        );
      })}
    </div>
  );
}
