import { NextRequest } from "next/server";
import { z } from "zod";
import { getLeads, createLead } from "@/services/leadService";
import { getRequestUser, applyRateLimit, ok, err } from "@/lib/apiHelpers";
import { sendNewLeadEmail } from "@/services/emailService";
import { emitNewLead } from "@/lib/socketEmitter";
import { ILead } from "@/types";

const PROPERTY_TYPES = ["Residential Plot","Commercial Plot","House","Apartment","Farm House","Shop","Office","Warehouse","Duplex","Penthouse","Commercial Building"] as const;
const LEAD_SOURCES   = ["Facebook Ads","Walk-in","Website Inquiry","Referral","Phone Call","Other"] as const;

const CreateLeadSchema = z.object({
  name:             z.string().min(2).max(80),
  email:            z.email(),
  phone:            z.string().min(7).max(15),
  propertyInterest: z.enum(PROPERTY_TYPES),
  source:           z.enum(LEAD_SOURCES).optional(),
  budget:           z.number().min(0),
  notes:            z.string().max(2000).nullish(),
  assignedTo:       z.string().nullish(),
  followUpDate:     z.string().nullish(),
});

export async function GET(req: NextRequest) {
  try {
    const user    = getRequestUser(req);
    const limited = applyRateLimit(req, user);
    if (limited) return limited;

    const { searchParams } = req.nextUrl;
    const filters = {
      status:     searchParams.get("status")     ?? undefined,
      priority:   searchParams.get("priority")   ?? undefined,
      assignedTo: searchParams.get("assignedTo") ?? undefined,
      search:     searchParams.get("search")     ?? undefined,
      dateFrom:   searchParams.get("dateFrom")   ?? undefined,
      dateTo:     searchParams.get("dateTo")     ?? undefined,
    };
    const page  = Number(searchParams.get("page")  ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const result = await getLeads(filters, user.role, user.id, page, limit);
    return ok(result);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to fetch leads", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user    = getRequestUser(req);
    const limited = applyRateLimit(req, user);
    if (limited) return limited;

    const body   = await req.json();
    const parsed = CreateLeadSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid input");

    const { notes, assignedTo, followUpDate, ...rest } = parsed.data;
    const lead = await createLead({
      ...rest,
      notes:         notes        ?? undefined,
      assignedTo:    assignedTo   ?? undefined,
      followUpDate:  followUpDate ?? undefined,
      createdById:   user.id,
      createdByRole: user.role,
    });

    // Fire-and-forget: email + socket notification
    sendNewLeadEmail(lead as unknown as ILead, process.env.EMAIL_USER ?? "").catch(() => null);
    emitNewLead(lead);

    return ok(lead, 201);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Failed to create lead", 500);
  }
}
