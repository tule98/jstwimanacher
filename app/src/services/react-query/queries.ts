import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import API from "@/services/api/client";
import {
  Category,
  LearningWord,
  StorySession,
  Bucket,
  HeatmapDataPoint,
} from "@/services/api/client";
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

export function useBuckets() {
  return useQuery<Bucket[]>({
    queryKey: queryKeys.buckets.all,
    queryFn: API.buckets.getAll,
  });
}

export function useBucketBalance(bucketId?: string) {
  return useQuery<{ income: number; expense: number }>({
    queryKey: queryKeys.buckets.balance(bucketId),
    queryFn: () => API.buckets.getBalance(bucketId!),
    enabled: !!bucketId,
  });
}

export function useTransactions(
  pageSize: number = 20,
  options?: {
    onlyUnresolved?: boolean;
    onlyVirtual?: boolean;
    search?: string;
    categoryId?: string;
    bucketId?: string;
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

export function useHeatmapData(year: number, month?: number) {
  return useQuery<HeatmapDataPoint[]>({
    queryKey: queryKeys.heatmap.data(year, month),
    queryFn: () => API.heatmap.getData({ year, month }),
  });
}
