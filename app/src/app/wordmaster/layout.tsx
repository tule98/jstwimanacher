import React from "react";
import SupabaseAuthGuard from "@/app/_components/SupabaseAuthGuard";

export default function WordmasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupabaseAuthGuard>{children}</SupabaseAuthGuard>;
}
