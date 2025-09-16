"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface AppTabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const AppTabsContext = createContext<AppTabsContextType | undefined>(undefined);

interface AppTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface AppTabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface AppTabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function AppTabs({
  value,
  onValueChange,
  className,
  children,
}: AppTabsProps) {
  return (
    <AppTabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </AppTabsContext.Provider>
  );
}

export function AppTabsList({ className, children }: AppTabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-tl-lg rounded-tr-2xl rounded-bl-lg rounded-br-lg bg-emerald-50 p-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        "border border-emerald-200 dark:border-emerald-800",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AppTabsTrigger({
  value,
  className,
  children,
}: AppTabsTriggerProps) {
  const context = useContext(AppTabsContext);
  if (!context) {
    throw new Error("AppTabsTrigger must be used within AppTabs");
  }

  const { value: activeValue, onValueChange } = context;
  const isActive = activeValue === value;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-tl-md rounded-tr-xl rounded-bl-md rounded-br-md px-3 py-1.5 text-sm font-medium",
        "ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-400"
          : "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-200",
        className
      )}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

// Compound component pattern
AppTabs.List = AppTabsList;
AppTabs.Trigger = AppTabsTrigger;

export default AppTabs;
