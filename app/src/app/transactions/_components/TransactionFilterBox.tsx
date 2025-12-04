"use client";
import * as React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  Divider,
  IconButton,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Search, X, Filter } from "lucide-react";
import { useCategories, useBuckets } from "@/services/react-query/queries";

interface TransactionFilterBoxProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (value: string) => void;
  selectedBucketIds?: string[];
  onBucketIdsChange?: (value?: string[]) => void;
  onlyUnresolved: boolean;
  onOnlyUnresolvedChange: (value: boolean) => void;
}

export default function TransactionFilterBox({
  searchQuery,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  selectedBucketIds,
  onBucketIdsChange,
  onlyUnresolved,
  onOnlyUnresolvedChange,
}: TransactionFilterBoxProps) {
  const { data: categories = [] } = useCategories();
  const { data: buckets = [] } = useBuckets();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const filterContent = (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: isMobile ? 0 : 2,
        border: isMobile ? 0 : 1,
        borderColor: "divider",
      }}
    >
      <Stack spacing={3}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search transactions by note..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange("")}>
                  <X size={16} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Divider />

        {/* Category Filter */}
        <TextField
          select
          fullWidth
          label="Category"
          value={selectedCategoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <MenuItem value="all">All categories</MenuItem>
          {incomeCategories.length > 0 && (
            <MenuItem disabled sx={{ fontWeight: 600, color: "success.main" }}>
              — Income —
            </MenuItem>
          )}
          {incomeCategories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: category.color,
                  }}
                />
                <span>{category.name}</span>
              </Stack>
            </MenuItem>
          ))}
          {expenseCategories.length > 0 && (
            <MenuItem disabled sx={{ fontWeight: 600, color: "error.main" }}>
              — Expense —
            </MenuItem>
          )}
          {expenseCategories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: category.color,
                  }}
                />
                <span>{category.name}</span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        {/* Buckets Filter (multi-select) */}
        <TextField
          select
          fullWidth
          label="Buckets"
          SelectProps={{
            multiple: true,
            renderValue: (selected) => {
              const labels = (selected as string[]).map(
                (id) => buckets.find((b) => b.id === id)?.name || id
              );
              return labels.join(", ");
            },
          }}
          value={selectedBucketIds || []}
          onChange={(e) => {
            const value = e.target.value as unknown as string[];
            if (onBucketIdsChange) {
              onBucketIdsChange(value.length ? value : undefined);
            }
          }}
        >
          {buckets.map((bucket) => (
            <MenuItem key={bucket.id} value={bucket.id}>
              {bucket.name}
              {bucket.is_default && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: "text.secondary" }}
                >
                  (Default)
                </Typography>
              )}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        {/* Toggle: Only Unresolved */}
        <FormControlLabel
          control={
            <Switch
              checked={onlyUnresolved}
              onChange={(e) => onOnlyUnresolvedChange(e.target.checked)}
            />
          }
          label="Only show unresolved transactions"
        />
      </Stack>
    </Box>
  );

  // Mobile: Show button that opens drawer
  if (isMobile) {
    return (
      <>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Filter size={18} />}
          onClick={() => setDrawerOpen(true)}
          sx={{ justifyContent: "flex-start" }}
        >
          Filter options
        </Button>
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "90vh",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filter options
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </IconButton>
            </Stack>
          </Box>
          {filterContent}
        </Drawer>
      </>
    );
  }

  // Desktop: Show inline
  return filterContent;
}
