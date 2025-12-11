"use client";
import React from "react";
import {
  Box,
  Paper,
  Stack,
  ButtonBase,
  Typography,
  Modal,
  useTheme,
} from "@mui/material";
import { ChevronUp, Plus } from "lucide-react";
import BottomNav from "./BottomNav";

type PlusAction = {
  label?: string;
  render?: () => React.ReactNode; // content to render inside modal
  onClick?: () => void; // optional handler when pressing plus (before modal)
};

type TopAction = {
  icon: React.ElementType;
  onClick: () => void;
  label?: string;
};

interface MobileBottomContextValue {
  setPlusAction: (action: PlusAction | null) => void;
  setTopAction: (action: TopAction | null) => void;
}

const MobileBottomContext = React.createContext<
  MobileBottomContextValue | undefined
>(undefined);

export function useMobileBottomActions() {
  const ctx = React.useContext(MobileBottomContext);
  if (!ctx)
    throw new Error(
      "useMobileBottomActions must be used within MobileBottomLayout"
    );
  return ctx;
}

export default function MobileBottomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [plusAction, setPlusAction] = React.useState<PlusAction | null>(null);
  const [topAction, setTopAction] = React.useState<TopAction | null>(null);
  const [open, setOpen] = React.useState(false);

  const handlePlusClick = () => {
    if (plusAction?.onClick) plusAction.onClick();
    if (plusAction?.render) setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <MobileBottomContext.Provider value={{ setPlusAction, setTopAction }}>
      <Box sx={{ width: 1, pb: { xs: 10, md: 0 } }}>{children}</Box>

      {/* Module selector FAB - centered bottom */}
      <Box
        component="nav"
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 50,
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 6,
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            backdropFilter: "blur(12px)",
            boxShadow: isDark
              ? "0 8px 16px rgba(0, 0, 0, 0.3)"
              : "0 8px 16px rgba(65, 88, 208, 0.15)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(65, 88, 208, 0.1)",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{ px: 3, py: 1.5, minHeight: 56 }}
          >
            {/* Module selector trigger (delegates to BottomNav's modal) */}
            <BottomNav variant="inline" />
          </Stack>
        </Paper>
      </Box>

      {/* Plus action FAB - right side */}
      <ButtonBase
        aria-label={plusAction?.label ?? "Add"}
        onClick={handlePlusClick}
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: 999,
          transition: "all 0.2s ease-out",
          backgroundColor: "#4158D0",
          boxShadow: "0 4px 12px rgba(65, 88, 208, 0.3)",
          "&:hover": {
            backgroundColor: "#3D4CBF",
            boxShadow: "0 6px 16px rgba(65, 88, 208, 0.4)",
            transform: "translateY(-2px)",
          },
          "&:active": { transform: "scale(0.92)" },
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </ButtonBase>

      {/* Top-right action FAB */}
      {topAction && (
        <ButtonBase
          aria-label={topAction.label ?? "Action"}
          onClick={topAction.onClick}
          sx={{
            display: { xs: "flex", md: "none" },
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 50,
            width: 48,
            height: 48,
            borderRadius: 999,
            transition: "all 0.2s ease-out",
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(65, 88, 208, 0.06)",
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(65, 88, 208, 0.12)",
              boxShadow: "0 4px 12px rgba(65, 88, 208, 0.2)",
            },
            "&:active": { transform: "scale(0.92)" },
          }}
        >
          <topAction.icon size={24} color="#4158D0" />
        </ButtonBase>
      )}

      {/* Plus modal */}
      <Modal
        open={open}
        onClose={handleClose}
        sx={{ display: { xs: "flex", md: "none" }, alignItems: "flex-end" }}
      >
        <Paper
          sx={{
            width: "100%",
            borderRadius: "16px 16px 0 0",
            borderTop: 1,
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E5E7EB",
            maxHeight: "80vh",
            overflow: "auto",
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            backgroundImage: "none",
            p: 2,
          }}
        >
          {plusAction?.render ? (
            plusAction.render()
          ) : (
            <Stack alignItems="center" spacing={1}>
              <ChevronUp
                size={16}
                style={{ color: theme.palette.text.secondary }}
              />
              <Typography variant="body2" color="text.secondary">
                No action provided.
              </Typography>
            </Stack>
          )}
        </Paper>
      </Modal>
    </MobileBottomContext.Provider>
  );
}
