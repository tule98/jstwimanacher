"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { useFlashCards } from "@/services/react-query/queries";
import {
  useCreateFlashCard,
  useUpdateFlashCard,
  useDeleteFlashCard,
} from "@/services/react-query/mutations";
import FlashCardItem from "./_components/FlashCardItem";
import FlashCardDialog from "./_components/FlashCardDialog";
import type { FlashCard } from "@/services/api/flash-cards";
import { toast } from "sonner";

export default function FlashCardsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [shuffled, setShuffled] = useState(false);

  const { data: cards, isLoading } = useFlashCards();
  const createMutation = useCreateFlashCard();
  const updateMutation = useUpdateFlashCard();
  const deleteMutation = useDeleteFlashCard();

  const handleCreate = async (data: {
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Flash card created!");
    } catch {
      toast.error("Failed to create flash card");
    }
  };

  const handleUpdate = async (data: {
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }) => {
    if (!editingCard) return;
    try {
      await updateMutation.mutateAsync({ id: editingCard.id, data });
      toast.success("Flash card updated!");
      setEditingCard(null);
    } catch {
      toast.error("Failed to update flash card");
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: FlashCard["status"]
  ) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status } });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flash card?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Flash card deleted!");
    } catch {
      toast.error("Failed to delete flash card");
    }
  };

  const handleEdit = (card: FlashCard) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleShuffle = () => {
    setShuffled(!shuffled);
  };

  const displayCards =
    shuffled && cards ? [...cards].sort(() => Math.random() - 0.5) : cards;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Flash Cards</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Shuffle">
            <IconButton color="primary" onClick={handleShuffle}>
              <ShuffleIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCard(null);
              setDialogOpen(true);
            }}
          >
            Add Card
          </Button>
        </Box>
      </Box>

      {!cards || cards.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No flash cards yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first flash card to start learning!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Your First Card
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {displayCards?.map((card: FlashCard) => (
            <Box
              key={card.id}
              sx={{
                flexBasis: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(33.333% - 16px)",
                },
              }}
            >
              <FlashCardItem
                card={card}
                onUpdateStatus={handleUpdateStatus}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
          ))}
        </Box>
      )}

      <FlashCardDialog
        open={dialogOpen}
        card={editingCard}
        onClose={() => {
          setDialogOpen(false);
          setEditingCard(null);
        }}
        onSave={editingCard ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
