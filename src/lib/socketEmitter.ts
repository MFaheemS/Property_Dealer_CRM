/**
 * Server-side socket emitter.
 * API routes call these functions to push real-time events to clients.
 * Falls back silently when socket server is not running (dev without `npm run dev:socket`).
 */

interface SocketIO {
  to: (room: string) => { emit: (event: string, data: unknown) => void };
  emit: (event: string, data: unknown) => void;
}

function getIO(): SocketIO | null {
  return (global as Record<string, unknown>).__socketIO as SocketIO | null ?? null;
}

export function emitNewLead(lead: unknown) {
  getIO()?.to("admins").emit("new_lead", lead);
}

export function emitLeadAssigned(agentId: string, lead: unknown) {
  getIO()?.to(`user:${agentId}`).emit("lead_assigned", lead);
}

export function emitStatusUpdate(agentId: string, lead: unknown) {
  getIO()?.to(`user:${agentId}`).emit("status_update", lead);
  getIO()?.to("admins").emit("status_update", lead);
}
