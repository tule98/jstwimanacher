"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AppCurrencyInputProps {
  value: string;
  onChange: (formattedValue: string, rawValue: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  locale?: string;
}

export default function AppCurrencyInput({
  value,
  onChange,
  placeholder = "Nhập số tiền",
  className,
  id,
  required = false,
  disabled = false,
  locale = "vi-VN",
}: AppCurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^\d]/g, "");

    if (numericValue) {
      const formattedValue = Number(numericValue).toLocaleString(locale);
      onChange(formattedValue, numericValue);
    } else {
      onChange("", "");
    }
  };

  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cn(
        "rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-white",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "border-gray-300 dark:border-gray-600",
        "focus:border-emerald-500 dark:focus:border-emerald-400",
        className
      )}
    />
  );
}
