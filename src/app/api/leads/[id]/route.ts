import { NextRequest } from "next/server";
import { z } from "zod";
import { getLeadById, updateLead, deleteLead } from "@/services/leadService";
import { getRequestUser, applyRateLimit, ok, err } from "@/lib/apiHelpers";
import { sendLeadAssignedEmail } from "@/services/emailService";
import { ILead, IUser } from "@/types";

const UpdateLeadSchema = z.object({
  name:             z.string().min(2).max(80).optional(),
  email:            z.email().optional(),
  phone:            z.string().min(7).max(15).optional(),
  propertyInterest: z.enum(["Residential Plot","Commercial Plot","House","Apartment","Farm House","Shop","Office"]).optional(),
  budget:           z.number().min(0).optional(),
  status:           z.enum(["new","contacted","qualified","negotiation","closed","lost"]).optional(),
  notes:            z.string().max(2000).optional(),
  assignedTo:       z.string().nullable().optional(),
  followUpDate:     z.string().nullable().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user   = getRequestUser(req);
    const lead   = await getLeadById(id, user.role, user.id);
    return ok(lead);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not found";
    return err(msg, msg === "Lead not found" ? 404 : msg === "Access denied" ? 403 : 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user   = getRequestUser(req);
    const limited = applyRateLimit(req, user);
    if (limited) return limited;

    const body   = await req.json();
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid input");

    // Get existing state for activity log comparison
    const existing = await getLeadById(id, user.role, user.id) as unknown as ILead;

    const previousAssignedTo = existing.assignedTo
      ? (typeof existing.assignedTo === "object"
          ? (existing.assignedTo as IUser)._id
          : existing.assignedTo as string)
      : null;

    const updated = await updateLead(id, {
      ...parsed.data,
      updatedById:        user.id,
      updatedByRole:      user.role,
      previousStatus:     existing.status,
      previousAssignedTo: previousAssignedTo as string | null,
    });

    // Email agent if assignment changed
    if (parsed.data.assignedTo && parsed.data.assignedTo !== previousAssignedTo) {
      const lead = updated as unknown as { assignedTo?: IUser };
      if (lead.assignedTo && typeof lead.assignedTo === "object") {
        sendLeadAssignedEmail(updated as unknown as ILead, lead.assignedTo).catch(() => null);
      }
    }

    return ok(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Update failed";
    return err(msg, msg === "Access denied" ? 403 : 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user   = getRequestUser(req);
    const result = await deleteLead(id, user.role, user.id);
    return ok(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return err(msg, msg.includes("admin") ? 403 : msg.includes("not found") ? 404 : 500);
  }
}
