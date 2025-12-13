"use client";
import React from "react";
import FeatureMuiProvider from "./FeatureMuiProvider";
import { createWordmasterTheme } from "@/lib/themes/wordmaster";

export default function WordmasterThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureMuiProvider themeFactory={createWordmasterTheme}>
      {children}
    </FeatureMuiProvider>
  );
}
