"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Calendar, BookText } from "lucide-react";
import AppButton from "@/components/ui/app-button";
import { useWords } from "@/services/react-query/queries";
import { LearningWord, StorySession } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  const [story, setStory] = useState<StorySession | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: words = [] } = useWords();
  const [wordsWithPhonetics, setWordsWithPhonetics] = useState<LearningWord[]>(
    []
  );

  // Lấy chi tiết truyện từ API
  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch(`/api/stories/${storyId}`);
        if (!res.ok) throw new Error("Failed to fetch story");
        const data = await res.json();
        setStory(data);

        // Parse danh sách từ từ JSON string
        if (data.words) {
          try {
            const wordIds = JSON.parse(data.words);
            const storyWords = wordIds
              .map((id: string) => words.find((w) => w.id === id))
              .filter(Boolean);
            setWordsWithPhonetics(storyWords);
          } catch (e) {
            console.error("Error parsing words:", e);
          }
        }
      } catch (error) {
        console.error("Error fetching story:", error);
      } finally {
        setLoading(false);
      }
    }

    if (storyId && words.length > 0) {
      fetchStory();
    }
  }, [storyId, words]);

  // Highlight từ có trong danh sách words và thêm phonetic
  const renderStoryWithPhonetics = (text: string) => {
    if (!text || wordsWithPhonetics.length === 0) return text;

    let highlightedText = text;

    // Sắp xếp từ theo độ dài giảm dần để tránh thay thế nhầm
    const sortedWords = [...wordsWithPhonetics].sort(
      (a, b) => b.word.length - a.word.length
    );

    // Thay thế mỗi từ với span highlight và tooltip
    sortedWords.forEach((wordObj) => {
      const word = wordObj.word;
      const phonetic = wordObj.phonetic;
      const regex = new RegExp(`\\b${word}\\b`, "gi");

      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-white px-1 py-0.5 rounded relative group">
          ${word}
          <span class="absolute bottom-full left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            ${phonetic || ""}
          </span>
        </span>`
      );
    });

    return highlightedText;
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-4 text-center">Đang tải...</div>;
  }

  if (!story) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        Không tìm thấy truyện
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          aria-label="Quay lại"
          className="rounded-full p-2"
        >
          <ArrowLeft size={20} />
        </AppButton>
        <h1 className="text-xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
          <BookOpen size={22} /> Chi tiết truyện
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span>{formatDate(story.created_at)}</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-full text-xs ml-auto">
            {story.status === "submitted" ? "Đã nộp" : "Bản nháp"}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Từ đã học:
          </h3>
          <div className="flex flex-wrap gap-2">
            {wordsWithPhonetics.map((w) => (
              <div
                key={w.id}
                className="px-3 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100 rounded-full text-sm flex flex-col items-center"
              >
                <span>{w.word}</span>
                <span className="text-xs opacity-75">{w.phonetic}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t dark:border-gray-700 pt-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <BookText size={18} className="text-emerald-600" />
            Nội dung truyện:
          </h2>
          <div
            className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: renderStoryWithPhonetics(story.story_text),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
