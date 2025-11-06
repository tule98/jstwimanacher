import React from "react";
import { addDays, subDays, format } from "date-fns";
import AppButton from "@/components/ui/app-button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  currentDate: string; // yyyy-MM-dd format
  onDateChange: (date: string) => void;
}

export default function DateNavigator({
  currentDate,
  onDateChange,
}: DateNavigatorProps) {
  const handlePreviousDay = () => {
    const date = new Date(currentDate);
    const previousDay = subDays(date, 1);
    onDateChange(format(previousDay, "yyyy-MM-dd"));
  };

  const handleToday = () => {
    const today = new Date();
    onDateChange(format(today, "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    const nextDay = addDays(date, 1);
    onDateChange(format(nextDay, "yyyy-MM-dd"));
  };

  return (
    <div className="flex gap-2 mt-1">
      <AppButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={handlePreviousDay}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
      >
        <ChevronLeft className="h-3 w-3 mr-1" />
        Previous day
      </AppButton>
      <AppButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleToday}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
      >
        Today
      </AppButton>
      <AppButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleNextDay}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
      >
        Next day
        <ChevronRight className="h-3 w-3 ml-1" />
      </AppButton>
    </div>
  );
}
