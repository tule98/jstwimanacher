"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { FlashCard } from "@/services/api/flash-cards";

interface FlashCardDialogProps {
  open: boolean;
  card?: FlashCard | null;
  onClose: () => void;
  onSave: (data: { word: string; phonetic?: string; meaning: string }) => void;
}

export default function FlashCardDialog({
  open,
  card,
  onClose,
  onSave,
}: FlashCardDialogProps) {
  const [word, setWord] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [meaning, setMeaning] = useState("");

  useEffect(() => {
    if (card) {
      setWord(card.word);
      setPhonetic(card.phonetic || "");
      setMeaning(card.meaning);
    } else {
      setWord("");
      setPhonetic("");
      setMeaning("");
    }
  }, [card, open]);

  const handleSave = () => {
    if (word.trim() && meaning.trim()) {
      onSave({
        word: word.trim(),
        phonetic: phonetic.trim() || undefined,
        meaning: meaning.trim(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{card ? "Edit Flash Card" : "New Flash Card"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Word"
          fullWidth
          value={word}
          onChange={(e) => setWord(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Phonetic (Optional)"
          fullWidth
          placeholder="/həˈloʊ/"
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Meaning"
          fullWidth
          multiline
          rows={3}
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!word.trim() || !meaning.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
