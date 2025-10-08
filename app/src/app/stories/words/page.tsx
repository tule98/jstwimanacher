"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import AppButton from "@/components/ui/app-button";
import { useWords } from "@/services/react-query/queries";
import { useCreateWord } from "@/services/react-query/mutations";

export default function WordsPage() {
  const { data: words = [], isLoading } = useWords();
  const createWord = useCreateWord();
  const [form, setForm] = useState({ word: "", phonetic: "", meaning: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.word.trim()) return;
    createWord.mutate(
      {
        word: form.word,
        phonetic: form.phonetic,
        meaning: form.meaning,
      },
      {
        onSuccess: () => setForm({ word: "", phonetic: "", meaning: "" }),
      }
    );
  }

  // Sắp xếp theo study_dates gần nhất (nếu có), nếu không thì theo added_at
  const sortedWords = [...words].sort((a, b) => {
    const aDate = a.study_dates?.length
      ? a.study_dates[a.study_dates.length - 1]
      : a.added_at;
    const bDate = b.study_dates?.length
      ? b.study_dates[b.study_dates.length - 1]
      : b.added_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Từ muốn học</h1>
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap gap-2 mb-6 items-end"
        autoComplete="off"
      >
        <Input
          name="word"
          value={form.word}
          onChange={handleChange}
          placeholder="Từ mới"
          className="w-32"
          required
        />
        <Input
          name="phonetic"
          value={form.phonetic}
          onChange={handleChange}
          placeholder="Phiên âm"
          className="w-32"
        />
        <Input
          name="meaning"
          value={form.meaning}
          onChange={handleChange}
          placeholder="Nghĩa"
          className="w-40"
        />
        <AppButton
          type="submit"
          size="sm"
          className="h-9"
          loading={createWord.isPending}
        >
          Thêm từ
        </AppButton>
      </form>
      <div className="flex flex-wrap gap-3">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : sortedWords.length === 0 ? (
          <div>Chưa có từ nào.</div>
        ) : (
          sortedWords.map((w) => (
            <div
              key={w.id}
              className={`rounded-lg border shadow px-4 py-2 min-w-[120px] flex flex-col items-center bg-white dark:bg-gray-900 ${
                w.is_mastered ? "ring-2 ring-emerald-400" : ""
              }`}
            >
              <span className="font-semibold text-lg">{w.word}</span>
              <span className="text-xs text-gray-500">{w.phonetic}</span>
              <span className="text-xs text-gray-400">{w.meaning}</span>
              {w.is_mastered && (
                <span className="text-emerald-600 text-xs mt-1">Đã thuộc</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
