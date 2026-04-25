import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import { logActivity } from "./activityService";
import { Types } from "mongoose";

export interface LeadFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateLeadInput {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  notes?: string;
  assignedTo?: string;
  followUpDate?: string;
  createdByRole: "admin" | "agent";
  createdById: string;
}

export interface UpdateLeadInput {
  name?: string;
  email?: string;
  phone?: string;
  propertyInterest?: string;
  budget?: number;
  status?: string;
  notes?: string;
  assignedTo?: string | null;
  followUpDate?: string | null;
  updatedById: string;
  updatedByRole: "admin" | "agent";
  previousStatus?: string;
  previousAssignedTo?: string | null;
}

/**
 * Build the MongoDB query from filter params.
 * Agents can only see their own leads.
 */
function buildQuery(
  filters: LeadFilters,
  requestingRole: "admin" | "agent",
  requestingId: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  if (requestingRole === "agent") {
    query.assignedTo = new Types.ObjectId(requestingId);
  } else if (filters.assignedTo) {
    query.assignedTo = new Types.ObjectId(filters.assignedTo);
  }

  if (filters.status)   query.status   = filters.status;
  if (filters.priority) query.priority = filters.priority;

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo)   query.createdAt.$lte = new Date(filters.dateTo);
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  return query;
}

export async function getLeads(
  filters: LeadFilters,
  requestingRole: "admin" | "agent",
  requestingId: string,
  page = 1,
  limit = 20
) {
  await connectDB();

  const query = buildQuery(filters, requestingRole, requestingId);
  const skip  = (page - 1) * limit;

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate("assignedTo", "name email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return { leads, total, page, pages: Math.ceil(total / limit) };
}

export async function getLeadById(
  id: string,
  requestingRole: "admin" | "agent",
  requestingId: string
) {
  await connectDB();

  const lead = await Lead.findById(id)
    .populate("assignedTo", "name email avatar role")
    .lean();

  if (!lead) throw new Error("Lead not found");

  // Agents can only access their own leads
  if (
    requestingRole === "agent" &&
    lead.assignedTo?.toString() !== requestingId
  ) {
    throw new Error("Access denied");
  }

  return lead;
}

export async function createLead(input: CreateLeadInput) {
  await connectDB();

  const lead = await Lead.create({
    name:             input.name,
    email:            input.email,
    phone:            input.phone,
    propertyInterest: input.propertyInterest,
    budget:           input.budget,
    notes:            input.notes ?? "",
    assignedTo:       input.assignedTo
                        ? new Types.ObjectId(input.assignedTo)
                        : null,
    followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
  });

  // Log creation
  await logActivity({
    leadId:      lead._id.toString(),
    action:      "lead_created",
    performedBy: input.createdById,
    meta:        { clientName: lead.name, budget: lead.budget },
  });

  return lead;
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  await connectDB();

  const existing = await Lead.findById(id);
  if (!existing) throw new Error("Lead not found");

  // Agent cannot update leads not assigned to them
  if (
    input.updatedByRole === "agent" &&
    existing.assignedTo?.toString() !== input.updatedById
  ) {
    throw new Error("Access denied");
  }

  const updatePayload: Record<string, unknown> = {};
  const fields = [
    "name", "email", "phone", "propertyInterest",
    "budget", "status", "notes", "followUpDate",
  ] as const;

  for (const f of fields) {
    if (input[f] !== undefined) updatePayload[f] = input[f];
  }

  // Handle assignedTo separately (allow explicit null to unassign)
  if ("assignedTo" in input) {
    updatePayload.assignedTo = input.assignedTo
      ? new Types.ObjectId(input.assignedTo)
      : null;
  }

  const updated = await Lead.findByIdAndUpdate(id, updatePayload, {
    new: true, runValidators: true,
  }).populate("assignedTo", "name email avatar role");

  // Log status change
  if (input.status && input.status !== input.previousStatus) {
    await logActivity({
      leadId:      id,
      action:      "status_changed",
      performedBy: input.updatedById,
      meta:        { from: input.previousStatus, to: input.status },
    });
  }

  // Log assignment change
  if (
    "assignedTo" in input &&
    input.assignedTo !== input.previousAssignedTo
  ) {
    await logActivity({
      leadId:      id,
      action:      "lead_assigned",
      performedBy: input.updatedById,
      meta:        { newAgent: input.assignedTo ?? "unassigned" },
    });
  }

  // Log note addition
  if (input.notes && input.notes !== existing.notes) {
    await logActivity({
      leadId:      id,
      action:      "note_added",
      performedBy: input.updatedById,
      meta:        { note: input.notes.slice(0, 100) },
    });
  }

  return updated;
}

export async function deleteLead(
  id: string,
  requestingRole: "admin" | "agent",
  requestingId: string
) {
  await connectDB();

  const lead = await Lead.findById(id);
  if (!lead) throw new Error("Lead not found");

  if (requestingRole !== "admin") throw new Error("Only admins can delete leads");

  await logActivity({
    leadId:      id,
    action:      "lead_deleted",
    performedBy: requestingId,
    meta:        { clientName: lead.name },
  });

  await lead.deleteOne();
  return { deleted: true };
}
