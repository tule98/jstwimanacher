import { httpClient } from "@/lib/http-client";

export interface Bucket {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBucketPayload {
  name: string;
  is_default?: boolean;
}

export const BucketsAPI = {
  async list(): Promise<Bucket[]> {
    return httpClient.get<Bucket[]>("/api/buckets");
  },
  async create(payload: CreateBucketPayload): Promise<Bucket> {
    const result = await httpClient.post<{ bucket: Bucket }>(
      "/api/buckets",
      payload
    );
    return result.bucket;
  },
};
