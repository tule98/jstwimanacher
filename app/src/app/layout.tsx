/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import React from "react";
import AppProvider from "./_components/AppProvider";
import MuiProvider from "./_components/MuiProvider";
import AppNav from "./_components/AppNav";
import BottomNav from "./_components/BottomNav";
import AuthGuard from "./_components/AuthGuard";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "💂 Doorkeeper",
  description: "💂 Doorkeeper",
};

export const viewport = {
  themeColor: "#388E3C", // Thêm màu chủ đạo xanh lá cây đậm
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        {/* App logo favicon */}
        <link rel="icon" type="image/png" href="/jstwi-logo.png" />
      </head>
      <body className="font-poppins min-h-screen dark:from-gray-900 transition-colors duration-300">
        <MuiProvider>
          <AppProvider>
            <AuthGuard>
              <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md hidden md:block">
                <div className="max-w-screen-lg mx-auto">
                  <AppNav />
                </div>
              </header>
              <div className="max-w-screen-lg mx-auto">
                <main className="flex flex-col items-center justify-start p-4 md:p-6 gap-6 pb-20 pt-4">
                  {children}
                </main>
              </div>
              {/* Mobile Bottom Navigation */}
              <div className="md:hidden">
                <BottomNav />
              </div>
            </AuthGuard>
            <Toaster richColors position="top-right" />
          </AppProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
