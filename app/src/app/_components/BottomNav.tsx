"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Ellipsis,
  Plus,
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
  Fab,
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

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const [navAnchorEl, setNavAnchorEl] =
    React.useState<HTMLButtonElement | null>(null);

  // Get current active module
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

  const handleAddClick = () => {
    // Handle transactions module
    if (pathname?.startsWith("/transactions")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-create-transaction"));
      }
      return;
    }

    // Handle habits module
    if (pathname?.startsWith("/habits")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-create-habit"));
      }
      return;
    }

    // Handle todos module
    if (pathname?.startsWith("/todos")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-create-todo"));
      }
      return;
    }

    // Handle stories module
    if (pathname?.startsWith("/stories")) {
      router.push("/stories/new");
      return;
    }

    // Handle flash-cards module
    if (pathname?.startsWith("/flash-cards")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-create-flash-card"));
      }
      return;
    }
  };

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
            elevation={8}
            sx={{
              position: "relative",
              borderRadius: 0,
              borderTop: 1,
              borderColor: "primary.light",
              bgcolor: "background.paper",
              backdropFilter: "blur(8px)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 1.5 }}
            >
              {/* Left Section: Navigation Module Selector */}
              <ButtonBase
                onClick={handleNavOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                  px: 1.5,
                  borderRadius: 1,
                  color: "text.primary",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                aria-haspopup="menu"
                aria-expanded={Boolean(navAnchorEl)}
              >
                {currentModule ? (
                  <>
                    <currentModule.icon size={24} />
                    <Typography
                      variant="body1"
                      textTransform="uppercase"
                      fontWeight={500}
                      noWrap
                    >
                      {currentModule.label}
                    </Typography>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <Ellipsis size={24} />
                    <Typography variant="caption" fontWeight={500}>
                      Menu
                    </Typography>
                  </>
                )}
              </ButtonBase>

              {/* Right Section: Floating Action Button */}
              <Fab
                onClick={handleAddClick}
                color="primary"
                size="medium"
                aria-label="Add"
                sx={{
                  position: "absolute",
                  right: 16,
                  bottom: "50%",
                  boxShadow: 4,
                  "&:hover": {
                    boxShadow: 6,
                  },
                  "&:active": {
                    transform: "translateY(50%) scale(0.95)",
                  },
                }}
              >
                <Plus size={24} />
              </Fab>
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* Navigation Bottom Sheet */}
      <Modal
        open={Boolean(navAnchorEl)}
        onClose={handleNavClose}
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "flex-end",
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        }}
      >
        <Paper
          sx={{
            width: "100%",
            borderRadius: "16px 16px 0 0",
            borderTop: 1,
            borderColor: "divider",
            maxHeight: "80vh",
            overflow: "auto",
            bgcolor: "background.paper",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Stack sx={{ py: 2 }}>
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
                    px: 3,
                    py: 1.5,
                    width: "100%",
                    color: isActive ? "primary.main" : "text.primary",
                    fontWeight: isActive ? 600 : 500,
                    transition: "all 0.2s",
                    bgcolor: isActive ? "action.selected" : "transparent",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <module.icon
                    size={20}
                    style={{
                      color: isActive ? theme.palette.primary.main : undefined,
                    }}
                  />
                  <Typography variant="body2" fontWeight={isActive ? 600 : 500}>
                    {module.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Paper>
      </Modal>
    </>
  );
}
