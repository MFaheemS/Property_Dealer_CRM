import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/apiHelpers";

/**
 * Rule-based AI suggestion engine.
 * Returns a contextual follow-up message based on lead's status, priority,
 * property interest, and days since creation.
 *
 * In production this could call an LLM API (e.g. Claude / GPT-4),
 * but for the assignment we use deterministic logic that is easy to explain.
 */
export async function POST(req: NextRequest) {
  try {
    getRequestUser(req);

    const { name, status, priority, propertyInterest, budget, daysSinceCreated } = await req.json();

    const suggestion = generateSuggestion({
      name,
      status,
      priority,
      propertyInterest,
      budget,
      daysSinceCreated: Number(daysSinceCreated ?? 0),
    });

    return NextResponse.json({ success: true, data: suggestion });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

interface SuggestInput {
  name:             string;
  status:           string;
  priority:         string;
  propertyInterest: string;
  budget:           number;
  daysSinceCreated: number;
}

interface Suggestion {
  action:  string;
  message: string;
  urgency: "high" | "medium" | "low";
}

function generateSuggestion(input: SuggestInput): Suggestion {
  const { name, status, priority, propertyInterest, daysSinceCreated } = input;
  const first = name.split(" ")[0];

  // Stale high-priority lead
  if (priority === "high" && daysSinceCreated > 3 && status === "new") {
    return {
      action:  "Immediate Call",
      message: `${first} is a high-priority lead who hasn't been contacted yet. Call immediately — high-budget clients have low patience and may go to competitors.`,
      urgency: "high",
    };
  }

  // Lost lead recovery
  if (status === "lost") {
    return {
      action:  "Re-engagement",
      message: `Send ${first} a personalized message with a new ${propertyInterest} listing that matches their requirements. Lost leads can be recovered with the right property.`,
      urgency: "low",
    };
  }

  // In negotiation — push to close
  if (status === "negotiation") {
    return {
      action:  "Close the Deal",
      message: `${first} is in negotiation. Schedule a site visit or offer a minor incentive to close. Deals in negotiation for over 48 hours risk cooling off.`,
      urgency: "high",
    };
  }

  // Contacted but not qualified
  if (status === "contacted" && daysSinceCreated > 5) {
    return {
      action:  "Qualification Call",
      message: `Follow up with ${first} to qualify their ${propertyInterest} requirements. Ask about timeline, location preference, and financing to move them to qualified.`,
      urgency: "medium",
    };
  }

  // New lead
  if (status === "new") {
    return {
      action:  "First Contact",
      message: `Reach out to ${first} within 24 hours. Introduce yourself and ask about their ${propertyInterest} preferences. First contact within a day increases conversion by 3x.`,
      urgency: "medium",
    };
  }

  // Qualified — move to negotiation
  if (status === "qualified") {
    return {
      action:  "Present Options",
      message: `${first} is qualified. Share 2–3 ${propertyInterest} options that match their budget. Schedule a site visit to move into negotiation.`,
      urgency: "medium",
    };
  }

  return {
    action:  "Check In",
    message: `Send ${first} a brief WhatsApp update on the latest ${propertyInterest} listings. Staying in touch keeps you top of mind.`,
    urgency: "low",
  };
}
