"use client";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import type { FlashCard } from "@/services/api/flash-cards";

interface FlashCardItemProps {
  card: FlashCard;
  onUpdateStatus: (id: string, status: FlashCard["status"]) => void;
  onEdit: (card: FlashCard) => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS: Record<
  FlashCard["status"],
  "default" | "primary" | "secondary" | "success"
> = {
  not_learned: "default",
  learning: "primary",
  learned: "secondary",
  mastered: "success",
};

const STATUS_LABELS: Record<FlashCard["status"], string> = {
  not_learned: "Not Learned",
  learning: "Learning",
  learned: "Learned",
  mastered: "Mastered",
};

const STATUS_ORDER: FlashCard["status"][] = [
  "not_learned",
  "learning",
  "learned",
  "mastered",
];

export default function FlashCardItem({
  card,
  onUpdateStatus,
  onEdit,
  onDelete,
}: FlashCardItemProps) {
  const [flipped, setFlipped] = useState(false);

  const handleStatusClick = () => {
    const currentIndex = STATUS_ORDER.indexOf(card.status);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    onUpdateStatus(card.id, STATUS_ORDER[nextIndex]);
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.02)" },
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        onClick={() => setFlipped(!flipped)}
      >
        <Box sx={{ mb: 2 }}>
          <Chip
            label={STATUS_LABELS[card.status]}
            color={STATUS_COLORS[card.status]}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusClick();
            }}
          />
        </Box>

        {!flipped ? (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" component="div">
              {card.word}
            </Typography>
            {card.phonetic && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, fontStyle: "italic" }}
              >
                {card.phonetic}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Typography variant="body1" color="text.secondary">
              {card.meaning}
            </Typography>
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          {flipped ? "Click to see word" : "Click to see meaning"}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
