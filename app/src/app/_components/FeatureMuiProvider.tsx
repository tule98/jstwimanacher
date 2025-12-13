"use client";
import React from "react";
import { CssBaseline, PaletteMode, Theme, ThemeProvider } from "@mui/material";
import { useThemeMode } from "./MuiProvider";

export type ThemeFactory = (mode: PaletteMode) => Theme;

export default function FeatureMuiProvider({
  children,
  themeFactory,
}: {
  children: React.ReactNode;
  themeFactory: ThemeFactory;
}) {
  const { mode } = useThemeMode();
  const theme = React.useMemo(() => themeFactory(mode), [mode, themeFactory]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
