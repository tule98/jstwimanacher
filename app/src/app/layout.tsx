/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import React from "react";
import type { Viewport } from "next";
import AppProvider from "./_components/AppProvider";
import ThemeModeProvider from "./_components/MuiProvider";
import AuthGuard from "./_components/AuthGuard";
import ClientToaster from "./_components/ClientToaster";

export const metadata = {
  title: "💂 Doorkeeper",
  description: "💂 Doorkeeper",
};

export const viewport: Viewport = {
  themeColor: "#1976d2", // Blue primary color
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        {/* App logo favicon */}
        <link rel="icon" type="image/png" href="/jstwi-logo.png" />
      </head>
      <body className="font-poppins min-h-screen transition-colors duration-300 md:pb-0">
        <ThemeModeProvider>
          <AppProvider>
            <AuthGuard>{children}</AuthGuard>
            <ClientToaster />
          </AppProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
