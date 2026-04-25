import { LeadPriority } from "@/types";
import { cn, PRIORITY_COLORS } from "@/lib/utils";

export default function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold", PRIORITY_COLORS[priority])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
