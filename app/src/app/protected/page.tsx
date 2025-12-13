/**
 * Example: Protected Server Component
 * This demonstrates how to protect a page using server-side auth check
 */

import { getCurrentUserServer } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { UserProfile } from "@/components/UserProfile";

export default async function ProtectedPage() {
  // Check authentication server-side
  const user = await getCurrentUserServer();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-6">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Protected Page
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is only accessible to authenticated users.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <UserProfile />

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              User Information
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: "background.default",
                borderRadius: 2,
                overflow: "auto",
              }}
            >
              {JSON.stringify(
                {
                  id: user.id,
                  email: user.email,
                  created_at: user.created_at,
                  user_metadata: user.user_metadata,
                },
                null,
                2
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
