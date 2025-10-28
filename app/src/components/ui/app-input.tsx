"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface AppInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "border-gray-300 dark:border-gray-600",
          "focus:border-emerald-500 dark:focus:border-emerald-400",
          className
        )}
        {...props}
      />
    );
  }
);

AppInput.displayName = "AppInput";

export default AppInput;
