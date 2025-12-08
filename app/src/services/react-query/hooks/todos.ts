import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TodosAPI, CreateTodoPayload } from "@/services/api/todos";

export const TODOS_QK = {
  base: ["todos"] as const,
  range: (start?: string, end?: string) => ["todos", { start, end }] as const,
};

export function useTodosList(start?: string, end?: string) {
  return useQuery({
    queryKey: TODOS_QK.range(start, end),
    queryFn: async () => {
      const res = await TodosAPI.list({ start, end });
      return res.items;
    },
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTodoPayload) =>
      TodosAPI.create(payload).then((r) => r.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_QK.base });
    },
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateTodoPayload>;
    }) => TodosAPI.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_QK.base });
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => TodosAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_QK.base });
    },
  });
}
