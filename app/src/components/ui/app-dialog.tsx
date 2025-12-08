"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  className?: string;
}

/**
 * @deprecated Use Dialog from MUI directly instead.
 * @param param0
 * @returns
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  maxWidth = "md",
}: AppDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          maxHeight: isMobile ? "100vh" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <DialogTitle sx={{ pb: description ? 1 : 2 }}>{title}</DialogTitle>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 3, pb: 2 }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <DialogContent
        sx={{
          flex: 1,
          overflow: "auto",
          pt: 3,
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            px: 3,
            py: 2,
            gap: 1.5,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default AppDialog;
