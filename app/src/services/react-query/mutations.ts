import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/services/api/client";
import { queryKeys } from "./query-keys";

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
      // Note: balance stats invalidation will be handled by the component
      // since it needs currentMonth and currentYear parameters
    },
  });
}

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
      // Note: balance stats invalidation will be handled by the component
    },
  });
}

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
      // Note: balance stats invalidation will be handled by the component
    },
  });
}

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
      // Note: balance stats invalidation will be handled by the component
    },
  });
}

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
      // Note: balance stats invalidation will be handled by the component
    },
  });
}
