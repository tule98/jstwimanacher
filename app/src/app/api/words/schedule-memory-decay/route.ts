/**
 * API: Schedule Memory Decay Cron Job
 * POST /api/words/schedule-memory-decay
 *
 * Sets up the daily cron job for memory decay
 * Should be called once during app initialization
 */

import { NextResponse, type NextRequest } from "next/server";
import { scheduleMemoryDecayJob } from "@/lib/memory-decay-scheduler";
import { withAuth } from "@/lib/route-handlers";

const handler = withAuth(
  async (request: NextRequest & { user: { id: string } }) => {
    try {
      // Only allow admins to schedule
      // In production, add proper authorization check

      const scheduled = await scheduleMemoryDecayJob();

      if (scheduled) {
        return NextResponse.json({
          success: true,
          message: "Memory decay cron job scheduled successfully",
          schedule: "Daily at 2:00 AM UTC",
        });
      } else {
        return NextResponse.json(
          { error: "Failed to schedule memory decay job" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Schedule memory decay error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to schedule memory decay job",
        },
        { status: 500 }
      );
    }
  }
);

export const POST = handler;
