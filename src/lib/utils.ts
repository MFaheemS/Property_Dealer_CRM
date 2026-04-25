import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LeadPriority, LeadStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as PKR — e.g. 25000000 → "PKR 2.5 Crore" */
export function formatPKR(amount: number): string {
  if (amount >= 10_000_000) {
    return `PKR ${(amount / 10_000_000).toFixed(1)} Crore`;
  }
  if (amount >= 100_000) {
    return `PKR ${(amount / 100_000).toFixed(1)} Lakh`;
  }
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/** Compute lead priority from budget */
export function computePriority(budget: number): LeadPriority {
  if (budget >= 20_000_000) return "high";
  if (budget >= 10_000_000) return "medium";
  return "low";
}

/** Compute lead score 0-100 from budget */
export function computeScore(budget: number): number {
  if (budget >= 20_000_000) return 90;
  if (budget >= 15_000_000) return 75;
  if (budget >= 10_000_000) return 60;
  if (budget >= 5_000_000)  return 40;
  return 20;
}

/** Format relative time — e.g. "2h ago" */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

/** Build WhatsApp click-to-chat URL for Pakistani numbers */
export function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCode = digits.startsWith("92")
    ? digits
    : `92${digits.replace(/^0/, "")}`;
  return `https://wa.me/${withCode}`;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  negotiation: "In Negotiation",
  closed: "Closed",
  lost: "Lost",
};

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  high:   "text-red-400 bg-red-400/10 border border-red-400/30",
  medium: "text-amber-400 bg-amber-400/10 border border-amber-400/30",
  low:    "text-emerald-400 bg-emerald-400/10 border border-emerald-400/30",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new:         "text-blue-400 bg-blue-400/10",
  contacted:   "text-purple-400 bg-purple-400/10",
  qualified:   "text-cyan-400 bg-cyan-400/10",
  negotiation: "text-amber-400 bg-amber-400/10",
  closed:      "text-emerald-400 bg-emerald-400/10",
  lost:        "text-red-400 bg-red-400/10",
};

/** Get user avatar URL from ui-avatars.com */
export function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=D4AF37&size=64&bold=true`;
}
