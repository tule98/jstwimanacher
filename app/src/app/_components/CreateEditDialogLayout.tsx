"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { X } from "lucide-react";

export interface CreateEditDialogLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  submitDisabled?: boolean;
  isLoading?: boolean;
  cancelLabel?: string;
  /**
   * If true, uses header-style layout with X button, title, and Save button at top.
   * If false (default), uses standard dialog with title bar and bottom action buttons.
   */
  useHeaderLayout?: boolean;
  /**
   * Width for the dialog. Defaults to 400px for standard layout, 100% for header layout.
   */
  maxWidth?: string | number;
  /**
   * Additional styles for DialogContent
   */
  contentSx?: object;
}

export default function CreateEditDialogLayout({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Save",
  submitIcon,
  submitDisabled = false,
  isLoading = false,
  cancelLabel = "Cancel",
  useHeaderLayout = false,
  maxWidth,
  contentSx = {},
}: CreateEditDialogLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleSubmit = () => {
    if (onSubmit && !submitDisabled && !isLoading) {
      onSubmit();
    }
  };

  if (useHeaderLayout) {
    // Header layout (like HabitForm) - Full screen on mobile, modal on desktop
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            borderRadius: 0,
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
          },
        }}
      >
        <Box sx={{ width: "100%", padding: "24px" }}>
          {/* Header with X, Title, and Save Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{ width: 44, height: 44, padding: 0 }}
            >
              <X size={24} color={theme.palette.text.secondary} />
            </IconButton>

            <Box
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {title}
            </Box>

            <Button
              onClick={handleSubmit}
              disabled={submitDisabled || isLoading}
              sx={{
                height: "44px",
                paddingX: "20px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: isDark ? "#5B7AFF" : "#4158D0",
                color: "#FFFFFF",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                "&:hover": {
                  backgroundColor: isDark ? "#4158D0" : "#3348B0",
                },
                "&:disabled": {
                  backgroundColor: isDark ? "#334155" : "#E5E7EB",
                  color: isDark ? "#64748B" : "#9CA3AF",
                },
              }}
            >
              {submitLabel}
            </Button>
          </Box>

          {/* Content */}
          <Box sx={{ ...contentSx }}>{children}</Box>
        </Box>
      </Dialog>
    );
  }

  // Standard dialog layout (like Todos) - Centered modal with title and bottom buttons
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: maxWidth || 400,
          maxWidth: maxWidth || 400,
          borderRadius: "12px",
          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        },
      }}
    >
      {/* Title Bar with Close Button */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "18px",
          fontWeight: 600,
          color: theme.palette.text.primary,
          padding: "16px 16px 12px 16px",
        }}
      >
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            width: 32,
            height: 32,
            padding: 0,
            color: theme.palette.text.secondary,
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* Content Area */}
      <DialogContent
        sx={{
          padding: "12px 16px",
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions
        sx={{
          padding: "12px 16px 16px 16px",
          gap: "8px",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            height: "32px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: "transparent",
            color: isDark ? "#5B7AFF" : "#4158D0",
            border: isDark ? "1px solid #334155" : "1px solid #E5E7EB",
            paddingX: "16px",
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(0, 0, 0, 0.02)",
            },
          }}
        >
          {cancelLabel}
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={submitDisabled || isLoading}
          startIcon={submitIcon}
          sx={{
            height: "36px",
            borderRadius: "18px",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: isDark ? "#5B7AFF" : "#4158D0",
            color: "#FFFFFF",
            paddingX: "20px",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
            "&:hover": {
              backgroundColor: isDark ? "#4158D0" : "#3348B0",
            },
            "&:disabled": {
              backgroundColor: isDark ? "#334155" : "#E5E7EB",
              color: isDark ? "#64748B" : "#9CA3AF",
            },
          }}
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
