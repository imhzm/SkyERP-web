"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MobileNav({ open, onClose, children }: MobileNavProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 w-72 bg-[#0a0a0a] border-l border-white/10 p-6 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white/50 hover:text-white"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
        <nav className="mt-12 space-y-1">{children}</nav>
      </div>
    </div>
  );
}
