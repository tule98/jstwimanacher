"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  CreditCard,
  PieChart,
  Settings,
  Link2,
  BookOpen,
  CheckSquare,
  Layers,
  FolderKanban,
  ListTodo,
  User,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const DRAWER_WIDTH = 280;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/transactions",
    label: "Transactions",
    icon: <CreditCard size={20} />,
  },
  { href: "/habits", label: "Habits", icon: <CheckSquare size={20} /> },
  { href: "/todos", label: "Todos", icon: <ListTodo size={20} /> },
  { href: "/stats", label: "Stats", icon: <PieChart size={20} /> },
  { href: "/conversions", label: "Conversions", icon: <Link2 size={20} /> },
  { href: "/stories", label: "Stories", icon: <BookOpen size={20} /> },
  { href: "/flash-cards", label: "Flash Cards", icon: <Layers size={20} /> },
  {
    href: "/categories",
    label: "Categories",
    icon: <FolderKanban size={20} />,
  },
  { href: "/config", label: "Settings", icon: <Settings size={20} /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Avatar
          src="/jstwi-logo.png"
          alt="Logo"
          sx={{
            width: 64,
            height: 64,
            margin: "0 auto",
            mb: 1,
            border: "3px solid",
            borderColor: "primary.main",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            letterSpacing: 1,
          }}
        >
          💂 Doorkeeper
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  bgcolor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                  },
                  transition: "all 0.2s",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "primary.main",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Profile Section */}
      <Box sx={{ p: 2 }}>
        {/* Theme Toggle */}
        <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
          <ThemeToggle />
        </Box>

        <ListItemButton
          sx={{
            borderRadius: 2,
            py: 1.5,
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
              <User size={18} />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary="User"
            secondary="user@example.com"
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
            secondaryTypographyProps={{
              fontSize: "0.75rem",
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  // Prevent hydration mismatch by rendering a consistent layout until mounted
  if (!isMounted) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            minHeight: "100vh",
            width: "100%",
            overflow: "auto",
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              position: "fixed",
              height: "100vh",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: 0,
          overflow: "auto",
        }}
      >
        {/* Page Content */}
        <Box sx={{ p: { xs: 0, sm: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
