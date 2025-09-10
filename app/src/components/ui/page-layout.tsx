import React from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto space-y-6 pb-16 font-poppins",
        className
      )}
    >
      {children}
    </div>
  );
}
