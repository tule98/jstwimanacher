"use client";
import * as React from "react";
import { PaletteMode } from "@mui/material";

const ThemeModeContext = React.createContext({
  mode: "light" as PaletteMode,
  toggleTheme: () => {},
});

export const useThemeMode = () => React.useContext(ThemeModeContext);

export default function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<PaletteMode>("light");

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

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
}
