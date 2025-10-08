"use client";
import Link from "next/link";
import {
  BookMarked,
  Plus,
  List,
  Calendar,
  BookOpen,
  CheckCircle,
  BookText,
} from "lucide-react";
import { useStories } from "@/services/react-query/queries";
import { useWords } from "@/services/react-query/queries";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import StoryModal from "./_components/StoryModal";
import { StorySession } from "@/db/schema";

export default function StoryListPage() {
  const { data: stories = [], isLoading } = useStories();
  const { data: words = [] } = useWords();
  const [selectedStory, setSelectedStory] = useState<StorySession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getWordsFromStory = (wordIds: string) => {
    try {
      const ids = JSON.parse(wordIds);
      return ids
        .map((id: string) => {
          const word = words.find((w) => w.id === id);
          return word ? word.word : "";
        })
        .filter(Boolean)
        .join(", ");
    } catch (e) {
      return "";
    }
  };

  const getWordsWithPhonetics = (wordIds: string) => {
    try {
      if (!wordIds) return [];

      const ids = JSON.parse(wordIds);
      return ids
        .map((id: string) => words.find((w) => w.id === id))
        .filter(Boolean);
    } catch (e) {
      console.error("Error parsing word IDs:", e);
      return [];
    }
  };

  const handleViewStory = (story: any) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookMarked className="h-8 w-8 text-emerald-600" />
          Stories
        </h1>
        <div className="flex space-x-2">
          <Link
            href="/stories/words"
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <List className="h-5 w-5" />
            Manage Words
          </Link>
          <Link
            href="/stories/new"
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Story
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-6 animate-pulse bg-gray-50"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12">
          <BookText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No stories yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first story to start practicing vocabulary
          </p>
          <Link
            href="/stories/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all rounded-xl p-6 bg-white cursor-pointer"
              onClick={() => handleViewStory(story)}
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="line-clamp-1">Story</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(story.created_at)}</span>
                {story.submitted_at && (
                  <span className="ml-auto">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-gray-600 line-clamp-3 mb-3">{story.A}</p>
              <div className="text-sm text-gray-500">
                <strong>Words:</strong> {getWordsFromStory(story.wordIds)}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStory && (
        <StoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          story={selectedStory}
          words={getWordsWithPhonetics(selectedStory.wordIds)}
        />
      )}
    </div>
  );
}
