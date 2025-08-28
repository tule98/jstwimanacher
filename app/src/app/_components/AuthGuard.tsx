"use client";
import { useState, useEffect } from "react";
import KeyInputForm from "./KeyInputForm";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có key trong cookie không
    const cookies = document.cookie.split(";");
    const protectionKeyCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("protection_key=")
    );

    if (protectionKeyCookie) {
      const key = protectionKeyCookie.split("=")[1];
      // Verify key với server
      verifyKey(key);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyKey = async (key: string) => {
    try {
      const response = await fetch("/api/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // Key không đúng, xóa cookie
        document.cookie =
          "protection_key=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    } catch (error) {
      console.error("Error verifying key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidKey = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <KeyInputForm onValidKey={handleValidKey} />;
  }

  return <>{children}</>;
}
