"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HabitsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/habits/main");
  }, [router]);

  return null;
}
