"use client";
import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Filter, Search, X } from "lucide-react";
import { useBuckets, useCategories } from "@/services/react-query/queries";
import { useDebounce } from "@/hooks/useDebounce";

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

  const [searchValue, setSearchValue] = React.useState(searchQuery);

  const selectedBuckets = React.useMemo(
    () => selectedBucketIds ?? [],
    [selectedBucketIds]
  );

  const debouncedSearch = useDebounce(searchValue, 300);

  React.useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  React.useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchQuery]);

  const handleBucketToggle = React.useCallback(
    (bucketId: string) => {
      if (!onBucketIdsChange) return;
      const next = selectedBuckets.includes(bucketId)
        ? selectedBuckets.filter((id) => id !== bucketId)
        : [...selectedBuckets, bucketId];
      onBucketIdsChange(next.length ? next : undefined);
    },
    [onBucketIdsChange, selectedBuckets]
  );

  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const filterContent = (
    <Box
      sx={{
        p: { xs: 1.75, md: 2.25 },
        bgcolor: "background.paper",
        borderRadius: isMobile ? 0 : 2,
        border: isMobile ? 0 : 1,
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2 }}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            fullWidth
            placeholder="Search by note"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
                endAdornment: searchValue ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchValue("")}>
                      <X size={16} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />

          <TextField
            select
            fullWidth
            label="Category"
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            sx={{ minWidth: { sm: 220 } }}
          >
            <MenuItem value="all">All categories</MenuItem>
            {incomeCategories.length > 0 && (
              <MenuItem
                disabled
                sx={{ fontWeight: 600, color: "success.main" }}
              >
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
        </Stack>

        <Box>
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              mb: 0.5,
              display: "block",
            }}
          >
            Buckets
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {buckets.map((bucket) => {
              const selected = selectedBuckets.includes(bucket.id);
              return (
                <Chip
                  key={bucket.id}
                  label={bucket.name}
                  color={selected ? "primary" : undefined}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => handleBucketToggle(bucket.id)}
                  onDelete={
                    selected && onBucketIdsChange
                      ? () => handleBucketToggle(bucket.id)
                      : undefined
                  }
                  deleteIcon={selected ? <X size={14} /> : undefined}
                  sx={{
                    mb: 0.5,
                    px: selected ? 1 : 0,
                    fontWeight: selected ? 600 : 500,
                  }}
                />
              );
            })}
            {!buckets.length && (
              <Typography variant="caption" color="text.secondary">
                No buckets available
              </Typography>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 0.25 }} />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={onlyUnresolved}
              onChange={(e) => onOnlyUnresolvedChange(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Only unresolved
            </Typography>
          }
          sx={{ ml: 0 }}
        />
      </Stack>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Filter size={16} />}
          onClick={() => setDrawerOpen(true)}
          sx={{ justifyContent: "flex-start", mt: 1 }}
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
          <Box sx={{ px: 2, py: 1.1, borderBottom: 1, borderColor: "divider" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filter options
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <X size={18} />
              </IconButton>
            </Stack>
          </Box>
          {filterContent}
        </Drawer>
      </>
    );
  }

  return filterContent;
}
