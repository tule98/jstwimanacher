"use client";
import * as React from "react";
import {
  useBuckets,
  useCreateBucket,
} from "@/services/react-query/hooks/buckets";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import AppPageNav from "../_components/AppPageNav";
import AppPageLayout from "../_components/AppPageLayout";
import { Package } from "lucide-react";

export default function BucketsPage() {
  const { data: buckets, isLoading, isError, error } = useBuckets();
  const createMutation = useCreateBucket();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setIsDefault(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createMutation.mutateAsync({
      name: name.trim(),
      is_default: isDefault,
    });
    handleClose();
  };

  return (
    <AppPageLayout header={<AppPageNav title="Buckets" icon={<Package />} />}>
      {isLoading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <Typography color="error">
          {(error as Error)?.message || "Failed to load buckets"}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {/* Create card as the first item */}
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                color="primary"
                onClick={handleOpen}
              >
                Add Bucket
              </Button>
              <Typography variant="body2" color="text.secondary">
                Create a new bucket
              </Typography>
            </Stack>
          </Card>

          {buckets?.map((b) => (
            <Card
              key={b.id}
              variant="outlined"
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {b.name}
                  </Typography>
                  {b.is_default && (
                    <Chip
                      icon={<StarIcon />}
                      size="small"
                      color="warning"
                      label="Default"
                    />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  ID: {b.id}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" disabled>
                  Edit
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create Bucket</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoFocus
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
              }
              label="Set as default bucket"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageLayout>
  );
}
