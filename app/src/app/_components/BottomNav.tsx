"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Ellipsis,
  PieChart,
  Link2,
  Settings,
  BookOpen,
  FolderKanban,
  Layers,
  CheckSquare,
  ListTodo,
  ChevronUp,
} from "lucide-react";
import {
  Box,
  Paper,
  Typography,
  Modal,
  ButtonBase,
  Stack,
  useTheme,
} from "@mui/material";

type NavModule = {
  href: string;
  label: string;
  icon: React.ElementType;
  onAdd?: () => void;
};

const NAV_MODULES: NavModule[] = [
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/todos", label: "Todos", icon: ListTodo },
  { href: "/stats", label: "Stats", icon: PieChart },
  { href: "/conversions", label: "Conversions", icon: Link2 },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/flash-cards", label: "Flash Cards", icon: Layers },
  { href: "/categories", label: "Categories", icon: FolderKanban },
  { href: "/config", label: "Settings", icon: Settings },
];

export default function BottomNav({
  variant = "full",
}: {
  variant?: "full" | "inline";
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [navAnchorEl, setNavAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);

  // Current active module
  const getCurrentModule = (): NavModule | undefined => {
    return NAV_MODULES.find((module) => pathname?.startsWith(module.href));
  };
  const currentModule = getCurrentModule();

  const handleNavOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNavAnchorEl(event.currentTarget);
  };

  const handleNavClose = () => {
    setNavAnchorEl(null);
  };

  const handleModuleSelect = (href: string) => {
    router.push(href);
    handleNavClose();
  };

  const selectorButton = (
    <ButtonBase
      onClick={handleNavOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.75,
        px: 2,
        borderRadius: 2,
        color: "text.primary",
        transition: "all 0.2s ease-out",
        "&:hover": {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(65, 88, 208, 0.05)",
        },
        "&:active": { transform: "scale(0.98)" },
      }}
      aria-haspopup="menu"
      aria-expanded={Boolean(navAnchorEl)}
    >
      {currentModule ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", color: "#4158D0" }}>
            <currentModule.icon size={24} />
          </Box>
          <Typography
            variant="button"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              textTransform: "capitalize",
              letterSpacing: "0.5px",
            }}
          >
            {currentModule.label}
          </Typography>
          <ChevronUp
            size={16}
            style={{ color: theme.palette.text.secondary }}
          />
        </>
      ) : (
        <>
          <Ellipsis size={24} />
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.secondary,
            }}
          >
            Menu
          </Typography>
        </>
      )}
    </ButtonBase>
  );

  const modal = (
    <Modal
      open={Boolean(navAnchorEl)}
      onClose={handleNavClose}
      sx={{
        display: { xs: "flex", md: "none" },
        alignItems: "flex-end",
        "& .MuiBackdrop-root": { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      }}
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Stack sx={{ py: 2, px: 1 }}>
          {NAV_MODULES.map((module) => {
            const isActive = pathname?.startsWith(module.href);
            return (
              <ButtonBase
                key={module.href}
                component={Link}
                href={module.href}
                onClick={() => handleModuleSelect(module.href)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  mx: 1,
                  mb: 0.5,
                  width: "calc(100% - 32px)",
                  borderRadius: 2,
                  color: isActive ? "#4158D0" : theme.palette.text.primary,
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.2s ease-out",
                  backgroundColor: isActive
                    ? isDark
                      ? "rgba(91, 122, 255, 0.1)"
                      : "rgba(65, 88, 208, 0.05)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(65, 88, 208, 0.05)",
                  },
                  "&:active": { transform: "scale(0.98)" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: isActive ? "#4158D0" : theme.palette.text.secondary,
                  }}
                >
                  <module.icon size={24} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#4158D0" : theme.palette.text.primary,
                    letterSpacing: "0.3px",
                  }}
                >
                  {module.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Stack>
      </Paper>
    </Modal>
  );

  if (variant === "inline") {
    return (
      <>
        {selectorButton}
        {modal}
      </>
    );
  }

  return (
    <>
      <Box
        component="nav"
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <Box
          sx={{
            mx: "auto",
            width: "100%",
            maxWidth: "lg",
            position: "relative",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              borderRadius: 0,
              borderTop: 1,
              borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E5E7EB",
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              backdropFilter: "blur(8px)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 1.5, minHeight: 64 }}
            >
              {selectorButton}
            </Stack>
          </Paper>
        </Box>
      </Box>
      {modal}
    </>
  );
}
