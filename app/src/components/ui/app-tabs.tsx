"use client";

import React, { createContext, useContext } from "react";
import { Box, Tabs, Tab } from "@mui/material";

interface AppTabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const AppTabsContext = createContext<AppTabsContextType | undefined>(undefined);

interface AppTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface AppTabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface AppTabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function AppTabs({ value, onValueChange, children }: AppTabsProps) {
  return (
    <AppTabsContext.Provider value={{ value, onValueChange }}>
      <Box sx={{ width: "100%" }}>{children}</Box>
    </AppTabsContext.Provider>
  );
}

export function AppTabsList({ children }: AppTabsListProps) {
  const context = useContext(AppTabsContext);
  if (!context) {
    throw new Error("AppTabsList must be used within AppTabs");
  }

  const { value, onValueChange } = context;

  // Extract tab values from children
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<AppTabsTriggerProps> =>
      React.isValidElement(child)
  );

  return (
    <Tabs
      value={value}
      onChange={(_, newValue) => onValueChange(newValue)}
      variant="fullWidth"
      sx={{
        minHeight: 40,
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiTabs-flexContainer": {
          gap: 0.5,
          p: 0.5,
          borderRadius: 0,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(27, 66, 216, 0.1)"
              : "rgba(27, 66, 216, 0.05)",
          border: 1,
          borderColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(27, 66, 216, 0.3)"
              : "rgba(27, 66, 216, 0.2)",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.props.value}
          value={tab.props.value}
          label={tab.props.children}
          sx={{
            minHeight: 36,
            flex: 1,
            px: 2,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 500,
            textTransform: "none",
            borderRadius: 0,
            color: "primary.main",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "#fff",
            },
            "&:hover": {
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(27, 66, 216, 0.2)"
                  : "rgba(27, 66, 216, 0.1)",
            },
            "&.Mui-selected:hover": {
              bgcolor: "primary.dark",
            },
          }}
        />
      ))}
    </Tabs>
  );
}

// Compound component pattern
AppTabs.List = AppTabsList;

export default AppTabs;
