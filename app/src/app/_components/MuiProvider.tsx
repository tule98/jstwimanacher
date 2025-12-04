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
          primary: {
            main: "#1976d2", // Material UI blue
            light: "#42a5f5",
            dark: "#1565c0",
          },
          ...(mode === "light"
            ? {
                background: {
                  default: "#f8fafc",
                  paper: "#ffffff",
                },
              }
            : {
                background: {
                  default: "#0c111c",
                  paper: "#161b27",
                },
              }),
        },
        shape: {
          borderRadius: 12,
        },
        spacing: 6,
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
          h1: { fontWeight: 600, letterSpacing: -0.5 },
          h2: { fontWeight: 600, letterSpacing: -0.4 },
          h3: { fontWeight: 600, letterSpacing: -0.3 },
          h4: { fontWeight: 600, letterSpacing: -0.2 },
          h5: { fontWeight: 600, letterSpacing: -0.1 },
          h6: { fontWeight: 600, letterSpacing: -0.05 },
          body1: { fontSize: "0.92rem", lineHeight: 1.4 },
          body2: { fontSize: "0.82rem", lineHeight: 1.35 },
          button: { fontWeight: 600, letterSpacing: 0 },
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
              disableElevation: true,
              variant: "contained",
            },
            styleOverrides: {
              root: {
                textTransform: "none",
                boxShadow: "none",
                borderRadius: 12,
                borderTopRightRadius: 28,
                borderBottomRightRadius: 18,
                padding: "4px 14px",
                "&:hover": {
                  boxShadow: "none",
                },
              },
              sizeSmall: {
                padding: "3px 10px",
              },
              sizeLarge: {
                padding: "6px 18px",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 12,
                paddingRight: 12,
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
          MuiChip: {
            defaultProps: {
              variant: "filled",
              size: "small",
            },
            styleOverrides: {
              root: {
                borderRadius: 10,
                borderTopRightRadius: 24,
                borderBottomRightRadius: 16,
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "2px 6px",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: "1px solid",
                borderColor: mode === "light" ? "#e2e8f0" : "#1f2933",
                backgroundImage: "none",
              },
            },
          },
          MuiCardContent: {
            styleOverrides: {
              root: {
                padding: 14,
                "&:last-child": {
                  paddingBottom: 14,
                },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 18,
                padding: 6,
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                paddingBottom: 6,
                fontSize: "1rem",
                fontWeight: 600,
              },
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                paddingTop: 6,
                paddingBottom: 6,
              },
            },
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                padding: "6px 12px 10px",
                gap: 6,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                padding: "8px 12px",
                borderColor: mode === "light" ? "#e2e8f0" : "#1f2933",
              },
              head: {
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: mode === "light" ? "#0f172a" : "#e2e8f0",
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
                minHeight: 48,
                paddingLeft: 12,
                paddingRight: 12,
                "@media (min-width:600px)": {
                  minHeight: 48,
                },
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                minHeight: 36,
                fontSize: "0.85rem",
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
          MuiInputBase: {
            styleOverrides: {
              root: {
                fontSize: "0.9rem",
              },
              input: {
                padding: "8px 10px",
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
