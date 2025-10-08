"use client";

import { useState } from "react";
import { useWords } from "@/services/react-query/queries";
import { useCreateStory } from "@/services/react-query/mutations";
import HighlightWithinTextarea from "react-highlight-within-textarea";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import AppButton from "@/components/ui/app-button";
import AppHighlightBlock from "@/components/ui/app-block";

export default function StoryNewPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { data: words = [], isLoading } = useWords();
  const createStory = useCreateStory();

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((w) => w !== id)
        : prev.length < 5
        ? [...prev, id]
        : prev
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: all selected words must appear in story
    const allIncluded = selected.every((id) => {
      const word = words.find((w) => w.id === id)?.word;
      return word && story.toLowerCase().includes(word.toLowerCase());
    });
    if (!allIncluded) {
      alert("Bạn phải sử dụng tất cả các từ đã chọn trong truyện!");
      return;
    }

    // Gửi dữ liệu lên server
    createStory.mutate(
      {
        words: selected,
        story_text: story,
        status: "submitted",
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => router.push("/stories"), 1200);
        },
        onError: (error) => {
          alert(`Lỗi khi lưu truyện: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
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
            <BookOpen size={22} /> Viết truyện mới
          </h1>
        </div>
      </div>
      <AppHighlightBlock
        title="Sáng tác truyện mới"
        value={
          <span className="text-base font-semibold">Chọn từ & Viết truyện</span>
        }
        icon={<BookOpen size={28} />}
        className="mt-2"
        variant="success"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-2 font-semibold text-green-700 dark:text-green-300">
              Chọn tối đa 5 từ để luyện tập:
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoading ? (
                <span>Đang tải...</span>
              ) : words.length === 0 ? (
                <span>Chưa có từ nào.</span>
              ) : (
                words.map((w) => {
                  const isSelected = selected.includes(w.id);
                  const isUsed = story
                    .toLowerCase()
                    .includes(w.word.toLowerCase());
                  return (
                    <AppButton
                      type="button"
                      key={w.id}
                      variant={isSelected ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleSelect(w.id)}
                      className={`flex flex-col items-center min-w-[80px] shadow-sm !px-3 !py-1 ${
                        selected.length >= 5 && !isSelected
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } ${
                        isUsed && isSelected
                          ? "ring-2 ring-green-400 ring-offset-2"
                          : isUsed
                          ? "ring-2 ring-yellow-400 ring-offset-2"
                          : ""
                      }`}
                      disabled={selected.length >= 5 && !isSelected}
                      title={`${w.word}${w.phonetic ? ` | ${w.phonetic}` : ""}${
                        w.meaning ? ` | ${w.meaning}` : ""
                      }`}
                    >
                      <span>{w.word}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {w.phonetic}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {w.meaning}
                      </span>
                    </AppButton>
                  );
                })
              )}
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-green-700 dark:text-green-300">
              Viết truyện của bạn (phải chứa tất cả các từ đã chọn):
            </label>
            <HighlightWithinTextarea
              value={story}
              onChange={setStory}
              highlight={selected
                .map((id) => {
                  const word = words.find((w) => w.id === id)?.word;
                  if (!word) return null;
                  // Regex: match whole word, ignore case
                  return {
                    highlight: new RegExp(
                      `\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`,
                      "gi"
                    ),
                    className:
                      "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-700/60 dark:text-white rounded px-1 transition-colors duration-200",
                  };
                })
                .filter(Boolean)}
              placeholder="Hãy sáng tạo một câu chuyện ngắn..."
              className="w-full min-h-[120px] rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
          <AppButton
            type="submit"
            size="lg"
            className="w-full text-lg gap-2"
            disabled={selected.length === 0 || story.trim() === "" || submitted}
          >
            <CheckCircle2 size={20} /> Nộp truyện
          </AppButton>
          {submitted && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mt-2">
              <CheckCircle2 size={20} /> Đã nộp truyện thành công!
            </div>
          )}
        </form>
      </AppHighlightBlock>
    </div>
  );
}
