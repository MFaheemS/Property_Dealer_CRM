import { LeadStatus } from "@/types";
import { cn, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

export default function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
