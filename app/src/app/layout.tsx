/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import AppProvider from "./_components/AppProvider";
import AppNav from "./_components/AppNav";
import AuthGuard from "./_components/AuthGuard";

export const metadata = {
  title: "jstwimanacher",
  description: "Tự trị",
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-poppins bg-gradient-to-b from-green-50 to-green-100 min-h-screen dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <AppProvider>
          <AuthGuard>
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md">
              <div className="max-w-screen-lg mx-auto">
                <AppNav />
              </div>
            </header>
            <div className="max-w-screen-lg mx-auto">
              <main className="flex flex-col items-center justify-start p-4 md:p-6 gap-6 pb-20 pt-4">
                {children}
              </main>
            </div>
          </AuthGuard>
        </AppProvider>
      </body>
    </html>
  );
}
