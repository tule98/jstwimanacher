"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Chip, Stack } from "@mui/material";
import type { SortOption } from "@/services/wordmaster";

type FilterOption = "learning" | "reviewing" | "well_known" | "all";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "memory_level", label: "Memory Level" },
  { value: "word_length", label: "Word Length" },
  { value: "recently_added", label: "Recently Added" },
  { value: "alphabetical", label: "Alphabetical" },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "learning", label: "Learning" },
  { value: "reviewing", label: "Reviewing" },
  { value: "well_known", label: "Well Known" },
];

export function FilterBottomSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get("sort") as SortOption) || "priority";
  const currentFilter = (searchParams.get("filter") as FilterOption) || "all";

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (filter: FilterOption) => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", filter);
    router.push(`?${params.toString()}`);
  };

  return (
    <Stack spacing={3} sx={{ padding: "24px" }}>
      {/* Sort Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "12px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Sort By
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => handleSortChange(option.value)}
              variant={currentSort === option.value ? "filled" : "outlined"}
              sx={{
                backgroundColor:
                  currentSort === option.value
                    ? "rgba(67, 24, 255, 0.4)"
                    : "transparent",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                fontWeight: currentSort === option.value ? 600 : 400,
                "&:hover": {
                  backgroundColor:
                    currentSort === option.value
                      ? "rgba(67, 24, 255, 0.5)"
                      : "rgba(255, 255, 255, 0.1)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Filter Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "12px",
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Filter
        </Typography>
        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onClick={() => handleFilterChange(option.value)}
              variant={currentFilter === option.value ? "filled" : "outlined"}
              sx={{
                backgroundColor:
                  currentFilter === option.value
                    ? "rgba(107, 138, 255, 0.4)"
                    : "transparent",
                borderColor: "rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                fontWeight: currentFilter === option.value ? 600 : 400,
                "&:hover": {
                  backgroundColor:
                    currentFilter === option.value
                      ? "rgba(107, 138, 255, 0.5)"
                      : "rgba(255, 255, 255, 0.1)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Spacing for bottom padding on mobile */}
      <Box sx={{ height: "8px" }} />
    </Stack>
  );
}
