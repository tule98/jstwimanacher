import { httpClient } from "@/lib/http-client";
import type { Todo, NewTodo } from "@/db/schema";

const base = "/api/todos" as const;

export interface CreateTodoPayload {
  id?: string;
  description: string;
  due_date?: string; // Optional; backend infers if not provided
  status?: "completed" | "not_completed";
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
