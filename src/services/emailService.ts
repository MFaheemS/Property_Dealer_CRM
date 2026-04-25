import nodemailer from "nodemailer";
import { ILead, IUser } from "@/types";

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST ?? "smtp.gmail.com",
  port:   Number(process.env.EMAIL_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { margin:0; padding:0; background:#0B1120; font-family: system-ui, sans-serif; }
        .wrapper { max-width:600px; margin:0 auto; padding:32px 16px; }
        .card { background:#111827; border:1px solid #1E293B; border-radius:12px; padding:32px; }
        .logo { font-size:22px; font-weight:700; color:#D4AF37; margin-bottom:24px; }
        .divider { border:none; border-top:1px solid #1E293B; margin:24px 0; }
        h2 { color:#F1F5F9; margin:0 0 12px; font-size:18px; }
        p  { color:#94A3B8; font-size:14px; line-height:1.6; margin:0 0 12px; }
        .badge { display:inline-block; padding:4px 12px; border-radius:9999px;
                 font-size:12px; font-weight:600; }
        .badge-high   { background:rgba(239,68,68,0.15); color:#EF4444; }
        .badge-medium { background:rgba(245,158,11,0.15); color:#F59E0B; }
        .badge-low    { background:rgba(16,185,129,0.15); color:#10B981; }
        .footer { margin-top:24px; text-align:center; color:#475569; font-size:12px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo">⬡ PropVault CRM</div>
          ${content}
        </div>
        <div class="footer">PropVault — Premium Real Estate CRM · Pakistan</div>
      </div>
    </body>
    </html>
  `;
}

/** Notify admin when a new lead is created */
export async function sendNewLeadEmail(lead: ILead, adminEmail: string) {
  if (!process.env.EMAIL_USER) return; // skip if email not configured

  const html = baseTemplate(`
    <h2>New Lead Received</h2>
    <hr class="divider" />
    <p><strong style="color:#F1F5F9">${lead.name}</strong> has been added as a new lead.</p>
    <p>📱 ${lead.phone} &nbsp;|&nbsp; 📧 ${lead.email}</p>
    <p>🏠 ${lead.propertyInterest}</p>
    <p>💰 Budget: <strong style="color:#D4AF37">${lead.budget.toLocaleString("en-PK")} PKR</strong></p>
    <p>Priority: <span class="badge badge-${lead.priority}">${lead.priority.toUpperCase()}</span></p>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      adminEmail,
    subject: `[PropVault] New Lead: ${lead.name}`,
    html,
  });
}

/** Notify agent when a lead is assigned to them */
export async function sendLeadAssignedEmail(lead: ILead, agent: IUser) {
  if (!process.env.EMAIL_USER) return;

  const html = baseTemplate(`
    <h2>Lead Assigned to You</h2>
    <hr class="divider" />
    <p>Hello <strong style="color:#F1F5F9">${agent.name}</strong>,</p>
    <p>A new lead has been assigned to you on PropVault.</p>
    <p><strong style="color:#F1F5F9">${lead.name}</strong></p>
    <p>📱 ${lead.phone} &nbsp;|&nbsp; 📧 ${lead.email}</p>
    <p>🏠 ${lead.propertyInterest}</p>
    <p>💰 Budget: <strong style="color:#D4AF37">${lead.budget.toLocaleString("en-PK")} PKR</strong></p>
    <p>Priority: <span class="badge badge-${lead.priority}">${lead.priority.toUpperCase()}</span></p>
    <p style="margin-top:16px">Log in to PropVault to view the full lead details and begin follow-up.</p>
  `);

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      agent.email,
    subject: `[PropVault] Lead Assigned: ${lead.name}`,
    html,
  });
}
