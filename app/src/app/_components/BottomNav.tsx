"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Ellipsis,
  Plus,
  PieChart,
  Link2,
  Settings,
  BookOpen,
  FolderKanban,
  Layers,
  CheckSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MoreItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const MORE_ITEMS: MoreItem[] = [
  { href: "/stats", label: "Stats", icon: PieChart },
  { href: "/conversions", label: "Conversions", icon: Link2 },
  { href: "/config", label: "Settings", icon: Settings },
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/categories", label: "Categories", icon: FolderKanban },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/flash-cards", label: "Flash Cards", icon: Layers },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isTransactions = pathname?.startsWith("/transactions");

  const handleAddClick = () => {
    if (isTransactions) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-create-transaction"));
      }
    } else {
      router.push("/transactions?create=1");
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="mx-auto w-full max-w-screen-lg">
          <div className="relative rounded-tl-xl rounded-tr-3xl rounded-bl-xl rounded-br-xl border-t border-emerald-100 bg-white/90 backdrop-blur dark:bg-gray-900/90 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-3">
              {/* Transactions */}
              <Link
                href="/transactions"
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors ${
                  isTransactions
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-medium">Transactions</span>
              </Link>

              {/* Spacer for center button */}
              <div className="w-16" />

              {/* More */}
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors ${
                  pathname === "/more"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
              >
                <Ellipsis className="h-6 w-6" />
                <span className="text-xs font-medium">More</span>
              </button>
            </div>

            {/* Center Add Button (only on /transactions) */}
            {isTransactions && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition-all duration-200 flex items-center justify-center border-4 border-white dark:border-gray-900"
                  aria-label="Add transaction"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* More Dialog */}
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>More</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {MORE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border p-4 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
              >
                <item.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
