"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export default function AppButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: AppButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 active:bg-emerald-800",
    secondary:
      "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 focus:ring-emerald-500 dark:bg-emerald-900 dark:hover:bg-emerald-800 dark:text-emerald-100",
    outline:
      "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white focus:ring-emerald-500 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400 dark:hover:text-gray-900",
    ghost:
      "text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 focus:ring-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900 dark:hover:text-emerald-300",
  };

  const sizeClasses = {
    sm: "px-4 py-1.5 text-sm rounded-tl-lg rounded-tr-2xl rounded-bl-lg rounded-br-lg",
    md: "px-5 py-2 text-base rounded-tl-xl rounded-tr-3xl rounded-bl-xl rounded-br-xl",
    lg: "px-7 py-3 text-lg rounded-tl-2xl rounded-tr-4xl rounded-bl-2xl rounded-br-2xl",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && "cursor-wait",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
