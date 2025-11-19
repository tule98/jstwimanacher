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
  shape: {
    // Slightly more rounded default corners across components
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      "Poppins",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(", "),
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: "contained",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          boxShadow: "none",
          // Corner emphasis: top-right the most, bottom-right more
          borderRadius: 10,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 16,
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiChip: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 16,
        },
      },
    },
  },
});

export default function MuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
