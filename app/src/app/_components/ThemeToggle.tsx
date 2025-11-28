"use client";
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./MuiProvider";

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip
      title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          borderRadius: 2,
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </IconButton>
    </Tooltip>
  );
}
