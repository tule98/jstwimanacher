"use client";
import * as React from "react";
import { Box } from "@mui/material";

export interface AppPageLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
  contentSx?: object;
}

export default function AppPageLayout({
  header,
  footer,
  children,
  sx,
  contentSx,
}: AppPageLayoutProps) {
  return (
    <Box sx={{ width: 1, ...sx }}>
      {header ? <Box sx={{ mb: 2 }}>{header}</Box> : null}
      <Box sx={{ px: { xs: 2, md: 3 }, ...contentSx }}>{children}</Box>
      {footer ? <Box sx={{ mt: 3 }}>{footer}</Box> : null}
    </Box>
  );
}
