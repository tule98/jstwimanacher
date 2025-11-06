"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
}

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "2xl",
  className,
}: AppDialogProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          maxWidthClasses[maxWidth],
          "max-h-[100dvh] p-0 flex flex-col overflow-hidden gap-0",
          className
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default AppDialog;
