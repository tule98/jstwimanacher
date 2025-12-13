/**
 * API: Manual Memory Decay Trigger
 * POST /api/words/memory-decay
 *
 * Allows manual triggering of memory decay for testing/admin purposes
 */

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/route-handlers";

const handler = withAuth(
  async (request: NextRequest & { user: { id: string } }) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify user has permission (optional - check user role)
      const supabase = await createSupabaseServerClient();

      // Get user's role (optional - adjust based on your auth setup)
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }

      // For now, allow any authenticated user to trigger decay
      // In production, restrict to admins only

      // Call the Supabase Edge Function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/memory-decay`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: result.error || "Failed to trigger memory decay" },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        decayedCount: result.decayedCount,
        totalDecayAmount: result.totalDecayAmount,
        message: result.message,
      });
    } catch (error) {
      console.error("Memory decay error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to trigger memory decay",
        },
        { status: 500 }
      );
    }
  }
);

export const POST = handler;
