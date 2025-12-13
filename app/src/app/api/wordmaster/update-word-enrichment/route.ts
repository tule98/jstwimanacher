/**
 * API: Update Word Enrichment
 * PATCH /api/wordmaster/update-word-enrichment
 *
 * Updates enriched word data (definition, phonetic, example, part of speech)
 * This allows users to re-enrich words with better data
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";

interface UpdateEnrichmentRequest {
  wordId: string;
  definition: string;
  phonetic: string;
  example_sentence: string;
  part_of_speech: string;
}

async function handleUpdateWordEnrichment(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateEnrichmentRequest = await request.json();
    const { wordId, definition, phonetic, example_sentence, part_of_speech } =
      body;

    console.log("Update enrichment request:", {
      wordId,
      definition,
      phonetic,
      example_sentence,
      part_of_speech,
    });

    if (!wordId || !definition) {
      return NextResponse.json(
        { error: "Missing required fields: wordId, definition" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // First, verify the word exists
    const { data: existingWord, error: fetchError } = await supabase
      .from("words")
      .select("id")
      .eq("id", wordId)
      .single();

    console.log("Word lookup result:", { existingWord, fetchError, wordId });

    if (fetchError || !existingWord) {
      console.error("Word not found:", wordId, fetchError);
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // Update the word with new enrichment data
    const { data, error } = await supabase
      .from("words")
      .update({
        definition,
        phonetic,
        example_sentence,
        part_of_speech,
      })
      .eq("id", wordId)
      .select();

    console.log("Update result:", { data, error });

    if (error) {
      console.error("Error updating word enrichment:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Failed to update word" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Word enrichment update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update word enrichment",
      },
      { status: 500 }
    );
  }
}

export const PATCH = withAuth(handleUpdateWordEnrichment);
