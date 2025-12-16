import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  compose,
  withAuth,
  withLog,
  type RouteHandler,
} from "@/lib/route-handlers";

/**
 * GET /api/user/timezone
 * Fetch current user's timezone preference from user_profiles
 */
const baseGET: RouteHandler = async (request) => {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = request.user.id;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("timezone")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch user timezone:", error);
      return NextResponse.json(
        { timezone: "Asia/Ho_Chi_Minh" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { timezone: data?.timezone || "Asia/Ho_Chi_Minh" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/timezone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = compose(withLog, withAuth)(baseGET);

/**
 * PUT /api/user/timezone
 * Update user's timezone preference in user_profiles
 */
const basePUT: RouteHandler = async (request) => {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = request.user.id;

    const { timezone } = await request.json();

    if (!timezone || typeof timezone !== "string") {
      return NextResponse.json(
        { error: "Invalid timezone parameter" },
        { status: 400 }
      );
    }

    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          user_id: userId,
          timezone: timezone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Failed to update user timezone:", error);
      return NextResponse.json(
        { error: "Failed to update timezone" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { timezone: data.timezone, message: "Timezone updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/user/timezone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PUT = compose(withLog, withAuth)(basePUT);
