import React from "react";
import {
  Dialog,
  DialogProps,
  useMediaQuery,
  useTheme,
  Modal,
  Box,
  BoxProps,
  Fade,
  Slide,
} from "@mui/material";

export interface ResponsiveDialogProps extends Omit<DialogProps, "children"> {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  mobileBottomSheet?: boolean;
  contentProps?: BoxProps;
}

export default function ResponsiveDialog({
  open,
  onClose,
  onOpenChange,
  children,
  mobileBottomSheet = true,
  contentProps,
  ...dialogProps
}: ResponsiveDialogProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // md = 960px+

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={250}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1E293B" : "#FFFFFF",
              border: (theme) =>
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "none",
            },
          },
        }}
        {...dialogProps}
      >
        {children}
      </Dialog>
    );
  }

  // Mobile: Bottom sheet style modal
  if (!mobileBottomSheet) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#1E293B" : "#FFFFFF",
            border: (theme) =>
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "none",
          },
        }}
        {...dialogProps}
      >
        {children}
      </Dialog>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      slotProps={{
        backdrop: {
          timeout: 250,
        },
      }}
    >
      <Slide direction="up" in={open} timeout={250}>
        <Box
          {...contentProps}
          sx={{
            width: "100%",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#1E293B" : "#FFFFFF",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "90vh",
            overflowY: "auto",
            border: (theme) =>
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "none",
            ...contentProps?.sx,
          }}
        >
          {children}
        </Box>
      </Slide>
    </Modal>
  );
}
