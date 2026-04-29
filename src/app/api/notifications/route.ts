import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/apiHelpers";
import { getNotifications, countUnread, markAllRead } from "@/services/notificationService";

export async function GET(req: NextRequest) {
  try {
    const user  = getRequestUser(req);
    const [notifications, unread] = await Promise.all([
      getNotifications(user.id),
      countUnread(user.id),
    ]);
    return NextResponse.json({ success: true, data: { notifications, unread } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getRequestUser(req);
    await markAllRead(user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
