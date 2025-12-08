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
} from "lucide-react";
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  ButtonBase,
  Stack,
  Fab,
  useTheme,
  Grid,
} from "@mui/material";

type MoreItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const MORE_ITEMS: MoreItem[] = [
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
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isTransactions = pathname?.startsWith("/transactions");

  const handleAddClick = () => {
    if (isTransactions) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-create-transaction"));
      }
    } else {
      router.push("/transactions?create=1");
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
        <Box sx={{ mx: "auto", width: "100%", maxWidth: "lg" }}>
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
              sx={{ px: 3, py: 1.5 }}
            >
              {/* Transactions */}
              <ButtonBase
                component={Link}
                href="/transactions"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  color: isTransactions ? "primary.main" : "text.secondary",
                  transition: "all 0.2s",
                }}
              >
                <CreditCard size={24} />
                <Typography variant="caption" fontWeight={500}>
                  Transactions
                </Typography>
              </ButtonBase>

              {/* Spacer for center button */}
              <Box sx={{ width: 64 }} />

              {/* More */}
              <ButtonBase
                onClick={() => setMoreOpen(true)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  color:
                    pathname === "/more" ? "primary.main" : "text.secondary",
                  transition: "all 0.2s",
                }}
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
              >
                <Ellipsis size={24} />
                <Typography variant="caption" fontWeight={500}>
                  More
                </Typography>
              </ButtonBase>
            </Stack>

            {/* Center Add Button (only on /transactions) */}
            {isTransactions && (
              <Box
                sx={{
                  position: "absolute",
                  top: -24,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <Fab
                  color="primary"
                  onClick={handleAddClick}
                  aria-label="Add transaction"
                  sx={{
                    width: 56,
                    height: 56,
                    boxShadow: 4,
                    border: 4,
                    borderColor: "background.paper",
                    "&:hover": {
                      boxShadow: 6,
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  <Plus size={24} />
                </Fab>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* More Dialog */}
      <Dialog
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>More</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {MORE_ITEMS.map((item) => (
              <Grid key={item.href}>
                <ButtonBase
                  component={Link}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    p: 2,
                    borderRadius: 0,
                    border: 1,
                    borderColor: "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(27, 66, 216, 0.1)"
                          : "rgba(27, 66, 216, 0.05)",
                    },
                  }}
                >
                  <item.icon
                    style={{
                      width: 24,
                      height: 24,
                      color: theme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={500}
                    color="text.primary"
                  >
                    {item.label}
                  </Typography>
                </ButtonBase>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
}
