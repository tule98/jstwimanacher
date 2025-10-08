import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/services/api/client";
import { queryKeys } from "./query-keys";

// Mutations for creating new words to learn
export function useCreateWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: API.words.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.words.all });
    },
  });
}

// Mutations for creating new stories
export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: API.stories.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.all });
    },
  });
}

// Mutations for transactions
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: API.transactions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtual.transactions,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unresolved.transactions,
      });
    },
  });
}

// Mutations for updating existing transactions
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: API.transactions.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtual.transactions,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unresolved.transactions,
      });
    },
  });
}

// Mutations for deleting transactions
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: API.transactions.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtual.transactions,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unresolved.transactions,
      });
    },
  });
}

// Mutations for toggling resolved/virtual status
export function useToggleResolvedTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; is_resolved: boolean }) =>
      API.transactions.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtual.transactions,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unresolved.transactions,
      });
    },
  });
}

// Mutations for toggling virtual status
export function useToggleVirtualTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; is_virtual: boolean }) =>
      API.transactions.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.virtual.transactions,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unresolved.transactions,
      });
    },
  });
}

// Mutations for creating categories
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      color: string;
      type: "income" | "expense";
    }) => API.categories.create(data.name, data.color, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
