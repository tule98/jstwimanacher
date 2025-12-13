import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * DELETE /api/wordmaster/delete-word
 * Removes a word from user's vocabulary
 * Body: { userWordId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userWordId } = await request.json();

    if (!userWordId) {
      return NextResponse.json(
        { error: "userWordId is required" },
        { status: 400 }
      );
    }

    // Verify the user_word belongs to the authenticated user
    const { data: userWord, error: fetchError } = await supabase
      .from("user_words")
      .select("id, user_id")
      .eq("id", userWordId)
      .single();

    if (fetchError || !userWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    if (userWord.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this word" },
        { status: 403 }
      );
    }

    // Delete the user_word record
    const { error: deleteError } = await supabase
      .from("user_words")
      .delete()
      .eq("id", userWordId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete word" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Word deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
