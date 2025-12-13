import { PaletteMode, Theme, createTheme } from "@mui/material";

export type ThemeFactory = (mode: PaletteMode) => Theme;

// Wordmaster mobile style guide themed MUI factory
export const createWordmasterTheme: ThemeFactory = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#4318FF",
        light: "#6B8AFF",
        dark: "#3348B0",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#FF6B35",
        light: "#FFA070",
        dark: "#E25A2D",
        contrastText: "#FFFFFF",
      },
      ...(mode === "light"
        ? {
            background: { default: "#FFFFFF", paper: "rgba(255,255,255,0.15)" },
            text: { primary: "#000000", secondary: "rgba(0,0,0,0.7)" },
            divider: "rgba(255,255,255,0.2)",
          }
        : {
            background: { default: "#0F0F0F", paper: "rgba(255,255,255,0.05)" },
            text: { primary: "#FFFFFF", secondary: "rgba(255,255,255,0.7)" },
            divider: "rgba(255,255,255,0.2)",
          }),
    },
    shape: { borderRadius: 24 },
    spacing: 4,
    typography: {
      fontFamily: [
        "SF Pro Display",
        "Roboto",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Helvetica",
        "Arial",
        "sans-serif",
      ].join(", "),
      h1: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: "2.5rem" },
      h2: { fontWeight: 600, letterSpacing: "-0.015em", fontSize: "2rem" },
      h3: { fontWeight: 600, fontSize: "1.5rem" },
      h4: { fontWeight: 500, fontSize: "1.25rem" },
      body1: { fontSize: "1rem", fontWeight: 400 },
      body2: { fontSize: "0.9375rem", fontWeight: 400 },
      caption: { fontSize: "0.75rem", fontWeight: 400 },
      button: {
        fontWeight: 600,
        textTransform: "none",
        fontSize: "0.875rem",
        letterSpacing: "0.3px",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundImage: "none" },
          "*": { transition: "color 300ms ease, background-color 300ms ease" },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(24px)",
            background:
              mode === "light"
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.05)",
            boxShadow:
              mode === "light"
                ? "0 2px 8px rgba(0,0,0,0.06)"
                : "0 2px 8px rgba(0,0,0,0.2)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            backgroundImage: "none",
            backdropFilter: "blur(24px)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 2px 8px rgba(0,0,0,0.06)" // very subtle
                : "0 2px 8px rgba(0,0,0,0.20)",
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.2)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.05)",
            backdropFilter: "blur(28px)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 3px 12px rgba(0,0,0,0.07)"
                : "0 3px 12px rgba(0,0,0,0.25)",
          }),
        },
      },
      MuiCardContent: { styleOverrides: { root: { padding: 24 } } },
      MuiButton: {
        defaultProps: { disableElevation: false },
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            borderRadius: 20,
            padding: "12px 20px",
            fontWeight: 600,
            boxShadow:
              theme.palette.mode === "light"
                ? "0 2px 8px rgba(0,0,0,0.10)"
                : "0 2px 8px rgba(0,0,0,0.30)",
            transition:
              "transform 150ms ease, box-shadow 200ms ease, background 300ms ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 3px 12px rgba(0,0,0,0.12)"
                  : "0 3px 12px rgba(0,0,0,0.35)",
            },
            "&:active": { transform: "scale(0.95)" },
          }),
          containedPrimary: {
            // subtle gradient per guide
            background: "linear-gradient(135deg, #4318FF 0%, #6B8AFF 100%)",
          },
          containedSecondary: {
            background: "linear-gradient(135deg, #FF6B35 0%, #FFA070 100%)",
          },
        },
      },
      MuiFab: {
        styleOverrides: { root: { borderRadius: 24, height: 80, width: 80 } },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 16, padding: "12px 16px" } },
      },
      MuiDivider: { styleOverrides: { root: { opacity: 0.2 } } },
      MuiCircularProgress: { styleOverrides: { root: { color: "#4318FF" } } },
    },
  });
