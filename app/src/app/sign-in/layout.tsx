"use client";
import React from "react";
import FeatureMuiProvider from "../_components/FeatureMuiProvider";
import { createDefaultTheme } from "@/lib/themes";

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureMuiProvider themeFactory={createDefaultTheme}>
      {children}
    </FeatureMuiProvider>
  );
}
