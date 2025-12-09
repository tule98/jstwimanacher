"use client";
import * as React from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  PaletteMode,
} from "@mui/material";

// Create theme context
const ThemeModeContext = React.createContext({
  mode: "light" as PaletteMode,
  toggleTheme: () => {},
});

export const useThemeMode = () => React.useContext(ThemeModeContext);

export default function MuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<PaletteMode>("light");

  // Load theme preference from localStorage on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as PaletteMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // Primary Color (Brand Blue)
          primary: {
            main: "#4158D0",
            light: "#5B7AFF",
            dark: "#3348B0",
          },
          // Secondary Color (Energetic Orange)
          secondary: {
            main: "#FFB01D",
            light: "#FFC247",
            dark: "#F59E0B",
          },
          // Success Color (Emerald Green)
          success: {
            main: "#10B981",
            light: "#34D399",
            dark: "#059669",
          },
          // Error Color (Vibrant Red)
          error: {
            main: "#EF4444",
            light: "#F87171",
            dark: "#DC2626",
          },
          // Warning Color (Amber)
          warning: {
            main: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          // Info Color (Cool Gray)
          info: {
            main: "#6B7280",
            light: "#9CA3AF",
            dark: "#4B5563",
          },
          ...(mode === "light"
            ? {
                // Light Mode
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
                // Dark Mode
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
          borderRadius: 16,
        },
        spacing: 8,
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
          // Display/Hero
          h1: {
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
          },
          // H1 (Large Title)
          h2: {
            fontSize: "1.75rem",
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: "-0.015em",
          },
          // H2 (Title)
          h3: {
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.33,
            letterSpacing: "-0.01em",
          },
          // H3 (Subtitle)
          h4: {
            fontSize: "1.25rem",
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: "0em",
          },
          // Body (Regular)
          h5: {
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: "0em",
          },
          // Body (Small)
          h6: {
            fontSize: "0.875rem",
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: "0em",
          },
          // Caption/Label
          body1: {
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.5,
          },
          body2: {
            fontSize: "0.875rem",
            fontWeight: 400,
            lineHeight: 1.43,
          },
          caption: {
            fontSize: "0.75rem",
            fontWeight: 500,
            lineHeight: 1.33,
            letterSpacing: "0.005em",
          },
          button: {
            fontSize: "1rem",
            fontWeight: 600,
            letterSpacing: "0.005em",
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
          // Button Styles
          MuiButton: {
            defaultProps: {
              disableElevation: false,
              variant: "contained",
            },
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: 24,
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                height: 48,
                transition: "all 0.2s ease-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              },
              contained: {
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                },
              },
              sizeSmall: {
                height: 40,
                padding: "8px 16px",
                fontSize: "0.875rem",
              },
              sizeLarge: {
                height: 56,
                padding: "16px 32px",
                fontSize: "1.125rem",
              },
            },
          },
          // Card Styles
          MuiCard: {
            styleOverrides: {
              root: (props) => ({
                borderRadius: 16,
                border: "none",
                backgroundColor:
                  props.theme.palette.mode === "light" ? "#FFFFFF" : "#1E293B",
                boxShadow:
                  props.theme.palette.mode === "light"
                    ? "0px 1px 3px rgba(0, 0, 0, 0.1)"
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
                padding: 16,
                "&:last-child": {
                  paddingBottom: 16,
                },
              },
            },
          },
          // Input Fields
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
                  height: 48,
                  borderRadius: 12,
                  backgroundColor:
                    props.theme.palette.mode === "light"
                      ? "#F9FAFB"
                      : "#0F172A",
                  "& fieldset": {
                    borderColor:
                      props.theme.palette.mode === "light"
                        ? "#E5E7EB"
                        : "#334155",
                    borderWidth: 1,
                  },
                  "&:hover fieldset": {
                    borderColor:
                      props.theme.palette.mode === "light"
                        ? "#D1D5DB"
                        : "#475569",
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
                fontSize: "1rem",
              },
              input: {
                padding: "12px 16px",
              },
            },
          },
          // Dialog/Modal
          MuiDialog: {
            styleOverrides: {
              paper: (props) => ({
                borderRadius: 16,
                padding: 8,
                backgroundColor:
                  props.theme.palette.mode === "light" ? "#FFFFFF" : "#1E293B",
              }),
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                fontSize: "1.25rem",
                fontWeight: 600,
                paddingBottom: 16,
              },
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                paddingTop: 16,
                paddingBottom: 16,
              },
            },
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                padding: "16px",
                gap: 8,
              },
            },
          },
          // Chip Component
          MuiChip: {
            defaultProps: {
              variant: "filled",
              size: "small",
            },
            styleOverrides: {
              root: (props) => ({
                borderRadius: 8,
                fontSize: "0.75rem",
                fontWeight: 500,
                lineHeight: 1.33,
                padding: "4px 8px",
                backgroundColor:
                  props.theme.palette.mode === "light"
                    ? "#F9FAFB"
                    : "rgba(255, 255, 255, 0.1)",
                color: props.theme.palette.text.primary,
              }),
            },
          },
          // ListItemButton
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 8,
              },
            },
          },
          MuiListItemIcon: {
            styleOverrides: {
              root: {
                minWidth: 44,
              },
            },
          },
          // Table
          MuiTableCell: {
            styleOverrides: {
              root: (props) => ({
                padding: "12px",
                borderColor:
                  props.theme.palette.mode === "light" ? "#E5E7EB" : "#334155",
              }),
              head: (props) => ({
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: props.theme.palette.text.primary,
                backgroundColor:
                  props.theme.palette.mode === "light"
                    ? "#F9FAFB"
                    : "rgba(255, 255, 255, 0.05)",
              }),
            },
          },
          // Menu Item
          MuiMenuItem: {
            styleOverrides: {
              root: {
                minHeight: 44,
                fontSize: "1rem",
              },
            },
          },
          // Form Control
          MuiFormControl: {
            styleOverrides: {
              root: {
                marginTop: 8,
                marginBottom: 8,
              },
            },
          },
          // Paper
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          // Toolbar
          MuiToolbar: {
            styleOverrides: {
              root: {
                minHeight: 56,
                paddingLeft: 16,
                paddingRight: 16,
                "@media (min-width:600px)": {
                  minHeight: 56,
                },
              },
            },
          },
          // Floating Action Button
          MuiFab: {
            styleOverrides: {
              root: (props) => ({
                borderRadius: 16,
                height: 56,
                width: 56,
                boxShadow:
                  props.theme.palette.mode === "light"
                    ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
                    : "0px 4px 12px rgba(0, 0, 0, 0.3)",
                transition: "all 0.2s ease-out",
                "&:hover": {
                  transform: "scale(1.08)",
                  boxShadow:
                    props.theme.palette.mode === "light"
                      ? "0px 8px 16px rgba(0, 0, 0, 0.2)"
                      : "0px 8px 16px rgba(0, 0, 0, 0.4)",
                },
                "&:active": {
                  transform: "scale(0.96)",
                },
              }),
            },
          },
          // Circular Progress
          MuiCircularProgress: {
            styleOverrides: {
              root: {
                color: "#4158D0",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
