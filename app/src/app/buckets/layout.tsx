"use client";
import React from "react";
import FeatureMuiProvider from "../_components/FeatureMuiProvider";
import DashboardLayout from "../_components/DashboardLayout";
import MobileBottomLayout from "../_components/MobileBottomLayout";
import { createDefaultTheme } from "@/lib/themes";

export default function BucketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureMuiProvider themeFactory={createDefaultTheme}>
      <MobileBottomLayout>
        <DashboardLayout>{children}</DashboardLayout>
      </MobileBottomLayout>
    </FeatureMuiProvider>
  );
}
