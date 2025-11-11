import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import API from "@/services/api/client";
import { Category, LearningWord, StorySession } from "@/services/api/client";
import { queryKeys } from "./query-keys";

export function useWords() {
  return useQuery<LearningWord[]>({
    queryKey: queryKeys.words.all,
    queryFn: API.words.getAll,
  });
}

export function useStories() {
  return useQuery<StorySession[]>({
    queryKey: queryKeys.stories.all,
    queryFn: API.stories.getAll,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories.all,
    queryFn: API.categories.getAll,
  });
}

export function useTransactions(
  pageSize: number = 20,
  options?: {
    onlyUnresolved?: boolean;
    onlyVirtual?: boolean;
    search?: string;
    categoryId?: string;
  }
) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.infinite(options),
    queryFn: ({ pageParam = 0 }) =>
      API.transactions.getWithPagination(pageSize, pageParam, options),
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than pageSize, no more pages
      if (lastPage.length < pageSize) return undefined;
      // Otherwise, return offset for next page
      return allPages.length * pageSize;
    },
    initialPageParam: 0,
    staleTime: 30000, // 30 seconds
  });
}
