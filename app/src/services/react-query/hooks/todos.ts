import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TodosAPI,
  TodoCategoriesAPI,
  CreateTodoPayload,
} from "@/services/api/todos";

export const TODOS_QK = {
  base: ["todos"] as const,
  range: (start?: string, end?: string) => ["todos", { start, end }] as const,
  categories: ["todos", "categories"] as const,
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

export function useTodoCategories() {
  return useQuery({
    queryKey: TODOS_QK.categories,
    queryFn: async () => {
      const res = await TodoCategoriesAPI.list();
      return res.items;
    },
  });
}

export function useDefaultTodoCategory() {
  const query = useTodoCategories();
  return {
    ...query,
    defaultCategory: query.data?.find((cat) => cat.is_default),
  } as const;
}

export function useCreateTodoCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      color,
      is_default,
    }: {
      name: string;
      color: string;
      is_default?: boolean;
    }) =>
      TodoCategoriesAPI.create({ name, color, is_default }).then((r) => r.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_QK.categories });
    },
  });
}

export function useUpdateTodoCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      color,
      name,
      is_default,
    }: {
      id: string;
      color?: string;
      name?: string;
      is_default?: boolean;
    }) =>
      TodoCategoriesAPI.update(id, { color, name, is_default }).then(
        (r) => r.item
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_QK.categories });
    },
  });
}
