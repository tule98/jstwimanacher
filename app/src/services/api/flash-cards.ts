import { httpClient } from "@/lib/http-client";

export interface FlashCard {
  id: string;
  word: string;
  phonetic?: string | null;
  meaning: string;
  example?: string | null;
  status: "not_learned" | "learning" | "learned" | "mastered";
  created_at: string;
  updated_at: string;
}

export const FlashCardsAPI = {
  async list(): Promise<FlashCard[]> {
    return httpClient.get<FlashCard[]>("/api/flash-cards");
  },
  async create(payload: { word: string; meaning: string }): Promise<FlashCard> {
    return httpClient.post<FlashCard>("/api/flash-cards", payload);
  },
  async update(
    id: string,
    payload: Partial<{
      word: string;
      meaning: string;
      status: FlashCard["status"];
    }>
  ): Promise<FlashCard> {
    return httpClient.put<FlashCard>(`/api/flash-cards/${id}`, payload);
  },
  async remove(id: string): Promise<{ success: boolean }> {
    return httpClient.delete<{ success: boolean }>(`/api/flash-cards/${id}`);
  },
};
