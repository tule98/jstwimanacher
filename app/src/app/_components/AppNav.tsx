"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  CheckSquare,
  ListTodo,
  PieChart,
  Link2,
  BookOpen,
  Layers,
  Settings,
} from "lucide-react";

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-primary text-white flex justify-center gap-2 sm:gap-4 py-3 mb-4 rounded-lg shadow-lg dark:bg-gray-900 dark:text-green-400">
      <Link
        href="/transactions"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/transactions"
            ? "bg-green-600/30 dark:bg-green-900/30"
            : ""
        }`}
      >
        <CreditCard size={18} />
        <span className="text-xs sm:text-sm">Transactions</span>
      </Link>
      <Link
        href="/habits"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/habits" ? "bg-green-600/30 dark:bg-green-900/30" : ""
        }`}
      >
        <CheckSquare size={18} />
        <span className="text-xs sm:text-sm">Habits</span>
      </Link>

      <Link
        href="/todos"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/todos" ? "bg-green-600/30 dark:bg-green-900/30" : ""
        }`}
      >
        <ListTodo size={18} />
        <span className="text-xs sm:text-sm">Todos</span>
      </Link>

      <Link
        href="/stats"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/stats" ? "bg-green-600/30 dark:bg-green-900/30" : ""
        }`}
      >
        <PieChart size={18} />
        <span className="text-xs sm:text-sm">Statistics</span>
      </Link>

      <Link
        href="/conversions"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/conversions"
            ? "bg-green-600/30 dark:bg-green-900/30"
            : ""
        }`}
      >
        <Link2 size={18} />
        <span className="text-xs sm:text-sm">Conversions</span>
      </Link>

      <Link
        href="/stories"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/stories" ? "bg-green-600/30 dark:bg-green-900/30" : ""
        }`}
      >
        <BookOpen size={18} />
        <span className="text-xs sm:text-sm">Stories</span>
      </Link>

      <Link
        href="/flash-cards"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/flash-cards"
            ? "bg-green-600/30 dark:bg-green-900/30"
            : ""
        }`}
      >
        <Layers size={18} />
        <span className="text-xs sm:text-sm">Flash Cards</span>
      </Link>

      <Link
        href="/config"
        className={`font-semibold hover:text-green-200 dark:hover:text-green-300 transition-colors flex flex-col sm:flex-row items-center gap-1 px-2 py-1 rounded-md ${
          pathname === "/config" ? "bg-green-600/30 dark:bg-green-900/30" : ""
        }`}
      >
        <Settings size={18} />
        <span className="text-xs sm:text-sm">Settings</span>
      </Link>
    </nav>
  );
}
