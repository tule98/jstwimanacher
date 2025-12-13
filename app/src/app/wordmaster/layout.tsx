import React from "react";
import SupabaseAuthGuard from "@/app/_components/SupabaseAuthGuard";
import WordmasterThemeProvider from "../_components/WordmasterThemeProvider";

export default function WordmasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WordmasterThemeProvider>
      <SupabaseAuthGuard>{children}</SupabaseAuthGuard>
    </WordmasterThemeProvider>
  );
}
