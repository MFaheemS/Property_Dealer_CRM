"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "toast-enter pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium",
              t.type === "success" && "bg-emerald-950/90 border-emerald-500/30 text-emerald-300",
              t.type === "error"   && "bg-red-950/90 border-red-500/30 text-red-300",
              t.type === "info"    && "bg-slate-900/90 border-slate-700/50 text-slate-300"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />}
            {t.type === "error"   && <XCircle      className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />}
            {t.type === "info"    && <Info         className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
