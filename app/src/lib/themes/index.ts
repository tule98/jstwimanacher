import { CssBaseline } from "@mui/material";
import { PaletteMode, Theme, ThemeProvider, createTheme } from "@mui/material";
import * as React from "react";

export type ThemeFactory = (mode: PaletteMode) => Theme;

export const createDefaultTheme: ThemeFactory = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#4158D0",
        light: "#5B7AFF",
        dark: "#3348B0",
      },
      secondary: {
        main: "#FFB01D",
        light: "#FFC247",
        dark: "#F59E0B",
      },
      success: {
        main: "#10B981",
        light: "#34D399",
        dark: "#059669",
      },
      error: {
        main: "#EF4444",
        light: "#F87171",
        dark: "#DC2626",
      },
      warning: {
        main: "#F59E0B",
        light: "#FBBF24",
        dark: "#D97706",
      },
      info: {
        main: "#6B7280",
        light: "#9CA3AF",
        dark: "#4B5563",
      },
      ...(mode === "light"
        ? {
            background: {
              default: "#FFFFFF",
              paper: "#F9FAFB",
            },
            text: {
              primary: "#111827",
              secondary: "#6B7280",
              disabled: "#D1D5DB",
            },
            divider: "#E5E7EB",
          }
        : {
            background: {
              default: "#0F172A",
              paper: "#1E293B",
            },
            text: {
              primary: "#F1F5F9",
              secondary: "#94A3B8",
              disabled: "#475569",
            },
            divider: "#334155",
          }),
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 6,
    typography: {
      fontFamily: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "SF Pro Display",
        "Segoe UI",
        "Roboto",
        "Helvetica",
        "Arial",
        "sans-serif",
      ].join(", "),
      h1: {
        fontSize: "1.5rem",
        fontWeight: 700,
        lineHeight: 1.33,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: "-0.015em",
      },
      h3: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.44,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
      h5: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
      h6: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0em",
      },
      body1: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: "0.625rem",
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: "0.005em",
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: 600,
        letterSpacing: "0.3px",
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: false,
          variant: "contained",
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 18,
            padding: "8px 20px",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.3px",
            height: 36,
            transition: "all 0.2s ease-out",
            "&:hover": {
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          contained: {
            boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)",
            "&:hover": {
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            },
          },
          sizeSmall: {
            height: 32,
            padding: "6px 12px",
            fontSize: "0.75rem",
          },
          sizeLarge: {
            height: 44,
            padding: "12px 24px",
            fontSize: "1rem",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: (props) => ({
            borderRadius: 12,
            border: "none",
            backgroundColor:
              props.theme.palette.mode === "light" ? "#FFFFFF" : "#1E293B",
            boxShadow:
              props.theme.palette.mode === "light"
                ? "0px 1px 2px rgba(0, 0, 0, 0.08)"
                : "none",
            borderTop:
              props.theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.05)"
                : "none",
            backgroundImage: "none",
          }),
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 12,
            "&:last-child": {
              paddingBottom: 12,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          autoComplete: "off",
          inputProps: {
            autoCapitalize: "none",
            autoCorrect: "off",
            spellCheck: false,
          },
        },
        styleOverrides: {
          root: (props) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              backgroundColor:
                props.theme.palette.mode === "light" ? "#F9FAFB" : "#0F172A",
              "& fieldset": {
                borderColor:
                  props.theme.palette.mode === "light" ? "#E5E7EB" : "#334155",
                borderWidth: 1,
              },
              "&:hover fieldset": {
                borderColor:
                  props.theme.palette.mode === "light" ? "#D1D5DB" : "#475569",
              },
              "&.Mui-focused fieldset": {
                borderColor: props.theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: (props) => ({
            borderRadius: 12,
            padding: 12,
            backgroundColor:
              props.theme.palette.mode === "light" ? "#FFFFFF" : "#1E293B",
          }),
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1rem",
            fontWeight: 600,
            paddingBottom: 12,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "12px",
            gap: 6,
          },
        },
      },
      MuiChip: {
        defaultProps: {
          variant: "filled",
          size: "small",
        },
        styleOverrides: {
          root: (props) => ({
            borderRadius: 6,
            fontSize: "0.625rem",
            fontWeight: 500,
            lineHeight: 1.4,
            padding: "3px 6px",
            backgroundColor:
              props.theme.palette.mode === "light"
                ? "#F9FAFB"
                : "rgba(255, 255, 255, 0.1)",
            color: props.theme.palette.text.primary,
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "9px 12px",
            marginBottom: 6,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 36,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: (props) => ({
            padding: "9px",
            borderColor:
              props.theme.palette.mode === "light" ? "#E5E7EB" : "#334155",
          }),
          head: (props) => ({
            fontSize: "0.625rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            color: props.theme.palette.text.primary,
            backgroundColor:
              props.theme.palette.mode === "light"
                ? "#F9FAFB"
                : "rgba(255, 255, 255, 0.05)",
          }),
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 36,
            fontSize: "0.875rem",
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            marginTop: 6,
            marginBottom: 6,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 44,
            paddingLeft: 12,
            paddingRight: 12,
            "@media (min-width:600px)": {
              minHeight: 44,
            },
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: (props) => ({
            borderRadius: 12,
            height: 44,
            width: 44,
            boxShadow:
              props.theme.palette.mode === "light"
                ? "0px 2px 8px rgba(0, 0, 0, 0.12)"
                : "0px 2px 8px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease-out",
            "&:hover": {
              transform: "scale(1.08)",
              boxShadow:
                props.theme.palette.mode === "light"
                  ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
                  : "0px 4px 12px rgba(0, 0, 0, 0.4)",
            },
            "&:active": {
              transform: "scale(0.96)",
            },
          }),
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: "#4158D0",
          },
        },
      },
    },
  });

export function ThemePreview({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return React.createElement(
    ThemeProvider,
    { theme },
    React.createElement(CssBaseline, null),
    children
  );
}
