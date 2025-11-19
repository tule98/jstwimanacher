"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BucketsAPI,
  Bucket,
  CreateBucketPayload,
} from "@/services/api/buckets";

// Local query keys for bucket-related operations
export const bucketQueryKeys = {
  all: ["buckets"] as const,
};

export function useBuckets() {
  return useQuery<Bucket[]>({
    queryKey: bucketQueryKeys.all,
    queryFn: BucketsAPI.list,
    staleTime: 60_000,
  });
}

export function useCreateBucket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBucketPayload) => BucketsAPI.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bucketQueryKeys.all });
    },
  });
}
