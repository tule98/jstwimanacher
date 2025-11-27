"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useState, useEffect } from "react";
import type { FlashCard } from "@/services/api/flash-cards";
import { toast } from "sonner";

interface FlashCardDialogProps {
  open: boolean;
  card?: FlashCard | null;
  onClose: () => void;
  onSave: (data: {
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }) => void;
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
  const [example, setExample] = useState("");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (card) {
      setWord(card.word);
      setPhonetic(card.phonetic || "");
      setMeaning(card.meaning);
      setExample(card.example || "");
    } else {
      setWord("");
      setPhonetic("");
      setMeaning("");
      setExample("");
    }
  }, [card, open]);

  const handleAutoTranslate = async () => {
    if (!word.trim()) {
      toast.error("Please enter a word first");
      return;
    }

    setTranslating(true);
    try {
      const response = await fetch("/api/flash-cards/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim() }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      setPhonetic(data.phonetic || "");
      setMeaning(data.meaning || "");
      setExample(data.example || "");
      toast.success("Translation completed!");
    } catch {
      toast.error("Failed to translate. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = () => {
    if (word.trim() && meaning.trim()) {
      onSave({
        word: word.trim(),
        phonetic: phonetic.trim() || undefined,
        meaning: meaning.trim(),
        example: example.trim() || undefined,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{card ? "Edit Flash Card" : "New Flash Card"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Word"
            fullWidth
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <Tooltip title="Auto-translate with AI">
            <span>
              <IconButton
                color="primary"
                onClick={handleAutoTranslate}
                disabled={translating || !word.trim()}
                sx={{ mt: 1 }}
              >
                {translating ? (
                  <CircularProgress size={24} />
                ) : (
                  <AutoFixHighIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
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
          rows={2}
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Example Sentence (Optional)"
          fullWidth
          multiline
          rows={3}
          placeholder="An example sentence using this word..."
          value={example}
          onChange={(e) => setExample(e.target.value)}
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
