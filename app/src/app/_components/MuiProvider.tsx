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
                  default: "#ffffff",
                  paper: "#f5f5f5",
                },
              }
            : {
                background: {
                  default: "#0b0f14",
                  paper: "#1a1f2e",
                },
              }),
        },
        shape: {
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
