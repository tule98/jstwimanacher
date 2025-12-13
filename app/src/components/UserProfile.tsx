/**
 * Example: User Profile Component with Sign Out
 * This shows how to use the useAuth hook in your components
 */

"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { LogOut } from "lucide-react";

export function UserProfile() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Not signed in
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: (t) => t.spacing(2),
        }}
      >
        <Avatar
          src={user.user_metadata?.avatar_url}
          alt={user.user_metadata?.full_name || user.email}
          sx={{ width: 48, height: 48 }}
        />

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user.user_metadata?.full_name || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={signOut}
          startIcon={<LogOut size={16} />}
          sx={{
            borderRadius: (t) => t.spacing(2),
            textTransform: "none",
          }}
        >
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
