/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import React from "react";
import AppProvider from "./_components/AppProvider";
import MuiProvider from "./_components/MuiProvider";
import DashboardLayout from "./_components/DashboardLayout";
import BottomNav from "./_components/BottomNav";
import AuthGuard from "./_components/AuthGuard";
import ClientToaster from "./_components/ClientToaster";

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
              <DashboardLayout>{children}</DashboardLayout>
              {/* Mobile Bottom Navigation */}
              <div className="md:hidden">
                <BottomNav />
              </div>
            </AuthGuard>
            <ClientToaster />
          </AppProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
