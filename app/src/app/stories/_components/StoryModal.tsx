"use client";

import React from "react";
import { BookText, X, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LearningWord, StorySession } from "@/db/schema";

type StoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  story: StorySession;
  words: LearningWord[];
};

export default function StoryModal({
  isOpen,
  onClose,
  story,
  words: wordsWithPhonetics,
}: StoryModalProps) {
  // Highlight words in the story text and add phonetic tooltips
  const renderStoryWithPhonetics = (text: string) => {
    if (!text || wordsWithPhonetics.length === 0) return text;

    let highlightedText = text;

    // Sort words by length in descending order to avoid replacing substrings
    const sortedWords = [...wordsWithPhonetics].sort(
      (a, b) => b.word.length - a.word.length
    );

    // Replace each word with a highlighted span and tooltip
    sortedWords.forEach((wordObj) => {
      const word = wordObj.word;
      const phonetic = wordObj.phonetic;
      if (!word) return;

      const regex = new RegExp(`\\b${word}\\b`, "gi");

      highlightedText = highlightedText.replace(
        regex,
        `<span class="relative group">
          <span class="font-medium text-emerald-600">${word}</span>
          <span class="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            ${phonetic || ""}
          </span>
        </span>`
      );
    });

    return highlightedText;
  };

  if (!story) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{"Story"}</DialogTitle>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(story.created_at)}</span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="pt-2">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Words used:
            </h3>
            <div className="flex flex-wrap gap-2">
              {wordsWithPhonetics.map((word) => (
                <Badge
                  key={word.id}
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  {word.word}{" "}
                  {word.phonetic && (
                    <span className="ml-1 text-slate-500">
                      ({word.phonetic})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <BookText size={18} className="text-emerald-600" />
              Story content:
            </h2>
            <div
              className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderStoryWithPhonetics(story.story_text),
              }}
            ></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
