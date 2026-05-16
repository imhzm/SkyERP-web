"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", handler); document.body.style.overflow = "hidden"; }
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className={`bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = "تأكيد", cancelText = "إلغاء", variant = "danger", loading }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-gray-300 text-sm mb-6">{message}</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} disabled={loading}
          className={`flex-1 py-2.5 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 ${
            variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-[#0A6CF1] hover:bg-[#0955c4]"
          }`}>
          {loading ? "جاري..." : confirmText}
        </button>
        <button onClick={onClose} disabled={loading}
          className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-lg text-sm hover:text-white transition cursor-pointer disabled:opacity-50">
          {cancelText}
        </button>
      </div>
    </Modal>
  );
}
