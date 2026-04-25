import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import { getRequestUser } from "@/lib/apiHelpers";
import { formatPKR } from "@/lib/utils";

// GET /api/export — download all leads as CSV (admin) or own leads (agent)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = getRequestUser(req);

    const query = user.role === "agent" ? { assignedTo: user.id } : {};
    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      "Name","Email","Phone","Property Interest",
      "Budget","Budget (Formatted)","Priority","Score",
      "Status","Notes","Assigned Agent","Follow-up Date","Created At",
    ];

    const rows = leads.map((l) => {
      const agent = l.assignedTo && typeof l.assignedTo === "object"
        ? (l.assignedTo as { name?: string }).name ?? ""
        : "";
      return [
        l.name,
        l.email,
        l.phone,
        l.propertyInterest,
        l.budget,
        formatPKR(l.budget),
        l.priority,
        l.score,
        l.status,
        (l.notes ?? "").replace(/,/g, ";"),
        agent,
        l.followUpDate ? new Date(l.followUpDate).toLocaleDateString("en-PK") : "",
        new Date(l.createdAt).toLocaleDateString("en-PK"),
      ].map((v) => `"${v}"`).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const filename = `propvault-leads-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Export failed" }, { status: 500 });
  }
}
