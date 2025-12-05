"use client";

import React from "react";
import { TextField } from "@mui/material";

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
    <TextField
      id={id}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={className}
      variant="outlined"
      fullWidth
    />
  );
}
