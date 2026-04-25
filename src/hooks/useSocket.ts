"use client";

import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuth }  from "@/hooks/useAuth";
import { useToast } from "@/components/shared/Toast";
import { ILead }    from "@/types";

/**
 * Connects to Socket.io and wires up real-time notifications.
 * Call once inside the dashboard layout.
 */
export function useSocket(onRefresh?: () => void) {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const connected  = useRef(false);

  useEffect(() => {
    if (!user || connected.current) return;
    connected.current = true;

    const socket = connectSocket(user._id, user.role);

    socket.on("new_lead", (lead: ILead) => {
      toast(`🏠 New lead: ${lead.name} (${lead.propertyInterest})`, "info");
      onRefresh?.();
    });

    socket.on("lead_assigned", (lead: ILead) => {
      toast(`📋 Lead assigned to you: ${lead.name}`, "info");
      onRefresh?.();
    });

    socket.on("status_update", (lead: ILead) => {
      toast(`🔄 Status updated: ${lead.name} → ${lead.status}`, "info");
      onRefresh?.();
    });

    socket.on("connect_error", () => {
      // Socket server not running — fail silently, fall back to manual refresh
    });

    return () => {
      disconnectSocket();
      connected.current = false;
    };
  }, [user]); // eslint-disable-line
}
