"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface TransactionFilters {
  search: string;
  categoryId: string;
  onlyUnresolved: boolean;
  bucketIds?: string[] | undefined;
}

export function useTransactionQueries() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse filters from URL search params
  const filters: TransactionFilters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      categoryId: searchParams.get("categoryId") || "all",
      onlyUnresolved: searchParams.get("onlyUnresolved") === "true",
      bucketIds: (() => {
        const raw = (searchParams.get("bucketIds") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return raw.length > 0 ? raw : undefined;
      })(),
    }),
    [searchParams]
  );

  // Update a single filter
  const updateFilter = useCallback(
    (key: keyof TransactionFilters, value: string | boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      // Convert value to string and handle empty/default values
      const stringValue = String(value);

      if (
        !stringValue ||
        stringValue === "" ||
        stringValue === "false" ||
        stringValue === "all"
      ) {
        // Remove param if it's empty, false, or "all"
        params.delete(key);
      } else {
        // Set param
        params.set(key, stringValue);
      }

      // Update URL without page reload
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Update multiple filters at once
  const updateFilters = useCallback(
    (updates: Partial<TransactionFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const stringValue = String(value);

        if (
          !stringValue ||
          stringValue === "" ||
          stringValue === "false" ||
          stringValue === "all"
        ) {
          params.delete(key);
        } else {
          params.set(key, stringValue);
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Individual setters for convenience
  const setSearch = useCallback(
    (value: string) => updateFilter("search", value),
    [updateFilter]
  );

  const setCategoryId = useCallback(
    (value: string) => updateFilter("categoryId", value),
    [updateFilter]
  );

  const setBucketIds = useCallback(
    (value?: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value.length === 0) {
        params.delete("bucketIds");
      } else {
        params.set("bucketIds", value.join(","));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setOnlyUnresolved = useCallback(
    (value: boolean) => updateFilter("onlyUnresolved", value),
    [updateFilter]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      filters.search !== "" ||
      filters.categoryId !== "all" ||
      (filters.bucketIds !== undefined && filters.bucketIds.length > 0) ||
      filters.onlyUnresolved,
    [filters]
  );

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    setSearch,
    setCategoryId,
    setBucketIds,
    setOnlyUnresolved,
    hasActiveFilters,
  };
}
