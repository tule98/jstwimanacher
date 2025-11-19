"use client";
import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Keep brand color aligned with existing themeColor
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#388E3C",
    },
    background: {
      default: "#0b0f14",
      paper: "#0f1420",
    },
  },
  typography: {
    fontFamily: ["Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"].join(", "),
  },
});

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
