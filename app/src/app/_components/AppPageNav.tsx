"use client";
import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export interface AppPageNavProps {
  title: string;
  icon?: React.ReactNode;
}

/**
 * AppPageNav
 * - Mobile: renders a sticky top AppBar with title and icon
 * - Desktop: renders a prominent page title row with icon
 */
export default function AppPageNav({ title, icon }: AppPageNavProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  if (!isDesktop) {
    return (
      <AppBar position="sticky" color="default" elevation={1} sx={{ mb: 2 }}>
        <Toolbar sx={{ minHeight: 56 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {icon ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.primary",
                  "& svg": { fontSize: 22 },
                }}
              >
                {icon}
              </Box>
            ) : null}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <Box sx={{ py: 2, mb: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {icon ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "text.primary",
              "& svg": { fontSize: 28 },
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
    </Box>
  );
}
