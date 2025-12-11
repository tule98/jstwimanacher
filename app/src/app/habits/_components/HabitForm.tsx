import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from "@mui/material";
import { X } from "lucide-react";
import ResponsiveDialog from "@/components/ui/ResponsiveDialog";

export interface HabitFormData {
  name: string;
  description?: string;
  frequency_type: "daily" | "custom";
  frequency_days?: number[];
  start_date?: string;
}

export interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HabitFormData) => void;
  initialData?: HabitFormData;
  isEdit?: boolean;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: HabitFormProps) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyType, setFrequencyType] = useState<"daily" | "custom">(
    "daily"
  );
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setFrequencyType(initialData.frequency_type);
      setSelectedDays(initialData.frequency_days || []);
      setStartDate(
        initialData.start_date || new Date().toISOString().slice(0, 10)
      );
    } else {
      // Reset form
      setName("");
      setDescription("");
      setFrequencyType("daily");
      setSelectedDays([]);
      setStartDate(new Date().toISOString().slice(0, 10));
    }
  }, [initialData, open]);

  const handleDayToggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (frequencyType === "custom" && selectedDays.length === 0) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency_type: frequencyType,
      frequency_days: frequencyType === "custom" ? selectedDays : undefined,
      start_date: startDate,
    });

    onClose();
  };

  const isValid =
    name.trim().length > 0 &&
    (frequencyType === "daily" || selectedDays.length > 0);

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      contentProps={{
        sx: {
          padding: "24px",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ width: 44, height: 44, padding: 0 }}
          >
            <X size={24} color={theme.palette.text.secondary} />
          </IconButton>

          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {isEdit ? "Edit Habit" : "New Habit"}
          </Typography>

          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            sx={{
              height: "44px",
              paddingX: "20px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "none",
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
              color: "#FFFFFF",
              border: (theme) =>
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#4158D0" : "#3348B0",
              },
              "&:disabled": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#64748B" : "#9CA3AF",
              },
            }}
          >
            Save
          </Button>
        </Box>

        {/* Name Input */}
        <Box sx={{ marginBottom: "20px" }}>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: (theme) => theme.palette.text.secondary,
              marginBottom: "8px",
              letterSpacing: "0.5px",
            }}
          >
            HABIT NAME
          </Typography>
          <TextField
            fullWidth
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning exercise"
            inputProps={{ maxLength: 50 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "48px",
                borderRadius: "12px",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#0F172A" : "#F9FAFB",
                fontSize: "16px",
                "& fieldset": {
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                },
                "&:hover fieldset": {
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "#475569" : "#D1D5DB",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: "2px",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: (theme) => theme.palette.text.primary,
                "&::placeholder": {
                  color: (theme) => theme.palette.text.secondary,
                  opacity: 0.7,
                },
              },
            }}
          />
        </Box>

        {/* Description Input */}
        <Box sx={{ marginBottom: "20px" }}>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: (theme) => theme.palette.text.secondary,
              marginBottom: "8px",
              letterSpacing: "0.5px",
            }}
          >
            DESCRIPTION (OPTIONAL)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this habit..."
            inputProps={{ maxLength: 200 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#0F172A" : "#F9FAFB",
                fontSize: "16px",
                "& fieldset": {
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                },
                "&:hover fieldset": {
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "#475569" : "#D1D5DB",
                },
                "&.Mui-focused fieldset": {
                  borderWidth: "2px",
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: (theme) => theme.palette.text.primary,
                "&::placeholder": {
                  color: (theme) => theme.palette.text.secondary,
                  opacity: 0.7,
                },
              },
            }}
          />
        </Box>

        {/* Frequency Selector */}
        <Box sx={{ marginBottom: "20px" }}>
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 500,
              color: (theme) => theme.palette.text.secondary,
              marginBottom: "8px",
              letterSpacing: "0.5px",
            }}
          >
            FREQUENCY
          </Typography>
          <ToggleButtonGroup
            value={frequencyType}
            exclusive
            onChange={(_, value) => value && setFrequencyType(value)}
            fullWidth
            sx={{
              height: "48px",
              "& .MuiToggleButton-root": {
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "12px",
                borderColor: (theme) =>
                  theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                color: (theme) => theme.palette.text.secondary,
                "&.Mui-selected": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark" ? "#4158D0" : "#3348B0",
                  },
                },
              },
            }}
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="custom">Custom Days</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Day Selector (if custom) */}
        {frequencyType === "custom" && (
          <Box sx={{ marginBottom: "20px" }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: (theme) => theme.palette.text.secondary,
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              SELECT DAYS
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
              }}
            >
              {DAY_LABELS.map((label, index) => (
                <Box
                  key={index}
                  onClick={() => handleDayToggle(index)}
                  sx={{
                    width: "100%",
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease-out",
                    backgroundColor: (theme) =>
                      selectedDays.includes(index)
                        ? theme.palette.mode === "dark"
                          ? "#5B7AFF"
                          : "#4158D0"
                        : theme.palette.mode === "dark"
                        ? "#0F172A"
                        : "#F9FAFB",
                    color: selectedDays.includes(index)
                      ? "#FFFFFF"
                      : (theme) => theme.palette.text.secondary,
                    border: (theme) =>
                      selectedDays.includes(index)
                        ? theme.palette.mode === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "none"
                        : theme.palette.mode === "dark"
                        ? "2px solid #334155"
                        : "2px solid #E5E7EB",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        selectedDays.includes(index)
                          ? theme.palette.mode === "dark"
                            ? "#4158D0"
                            : "#3348B0"
                          : theme.palette.mode === "dark"
                          ? "#334155"
                          : "#E5E7EB",
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                  title={DAY_NAMES[index]}
                >
                  {label}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Start Date */}
        {!isEdit && (
          <Box sx={{ marginBottom: "20px" }}>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                color: (theme) => theme.palette.text.secondary,
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              START DATE
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              inputProps={{
                min: new Date().toISOString().slice(0, 10),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#0F172A" : "#F9FAFB",
                  fontSize: "16px",
                  "& fieldset": {
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "#334155" : "#E5E7EB",
                  },
                  "&:hover fieldset": {
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "#475569" : "#D1D5DB",
                  },
                  "&.Mui-focused fieldset": {
                    borderWidth: "2px",
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "#5B7AFF" : "#4158D0",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  color: (theme) => theme.palette.text.primary,
                },
              }}
            />
          </Box>
        )}
      </Box>
    </ResponsiveDialog>
  );
}
