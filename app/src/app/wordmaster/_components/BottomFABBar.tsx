"use client";

import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { Filter, Plus, UserCircle2 } from "lucide-react";
import ResponsiveDialog from "@/components/ui/ResponsiveDialog";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { UserProfileSheet } from "./UserProfileSheet";

interface BottomFABBarProps {
  userId: string;
  onAddWordClick: () => void;
  onLogout: () => Promise<void>;
}

export function BottomFABBar({
  userId,
  onAddWordClick,
  onLogout,
}: BottomFABBarProps) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  return (
    <>
      {/* Filter Button */}
      <IconButton
        onClick={() => setFilterSheetOpen(true)}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 200ms ease-out",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <Filter size={16} />
      </IconButton>

      {/* Add Word Button */}
      <IconButton
        onClick={onAddWordClick}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          background: "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 200ms ease-out",
          "&:hover": {
            background: "linear-gradient(90deg, #5629FF 0%, #7B9AFF 100%)",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <Plus size={16} />
      </IconButton>

      {/* User Profile Button */}
      <IconButton
        onClick={() => setProfileSheetOpen(true)}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 200ms ease-out",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            transform: "scale(1.05)",
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        }}
      >
        <UserCircle2 size={16} />
      </IconButton>

      {/* Filter Bottom Sheet */}
      <ResponsiveDialog
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        onOpenChange={setFilterSheetOpen}
        mobileBottomSheet
      >
        <FilterBottomSheet />
      </ResponsiveDialog>

      {/* User Profile Bottom Sheet */}
      <ResponsiveDialog
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        onOpenChange={setProfileSheetOpen}
        mobileBottomSheet
      >
        <UserProfileSheet
          userId={userId}
          onLogout={async () => {
            await onLogout();
            setProfileSheetOpen(false);
          }}
        />
      </ResponsiveDialog>
    </>
  );
}
