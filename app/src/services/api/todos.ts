import { httpClient } from "@/lib/http-client";
import type { Todo, TodoCategory } from "@/db/schema";

const base = "/api/todos" as const;
const categoriesBase = "/api/todos/categories" as const;

export interface CreateTodoPayload {
  id?: string;
  description: string;
  due_date?: string; // Optional; backend infers if not provided
  status?: "completed" | "not_completed";
  category_id?: string;
  recurrence_type?: "none" | "daily" | "weekly" | "specific_days";
  recurrence_days?: number[];
}

export interface TodoCategoryPayload {
  name?: string;
  color?: string;
  is_default?: boolean;
}

export const TodosAPI = {
  list: (params?: { start?: string; end?: string }) =>
    httpClient.get<{ items: Todo[] }>(base, params),
  create: (payload: CreateTodoPayload) =>
    httpClient.post<{ item: Todo }>(base, payload),
  update: (id: string, payload: Partial<CreateTodoPayload>) =>
    httpClient.put(base + "/" + id, payload),
  remove: (id: string) => httpClient.delete(base + "/" + id),
};

export const TodoCategoriesAPI = {
  list: () => httpClient.get<{ items: TodoCategory[] }>(categoriesBase),
  create: (payload: { name: string; color: string; is_default?: boolean }) =>
    httpClient.post<{ item: TodoCategory }>(categoriesBase, payload),
  update: (id: string, payload: TodoCategoryPayload) =>
    httpClient.put<{ item: TodoCategory }>(categoriesBase, {
      id,
      ...payload,
    }),
  remove: (id: string) =>
    httpClient.delete<{ success: boolean }>(categoriesBase, { id }),
};
