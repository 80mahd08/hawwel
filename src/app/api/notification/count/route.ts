import { getNotificationCount } from "@/lib/dbFunctions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("clerkId");

  if (!clerkId) {
    return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
  }

  try {
    const count = await getNotificationCount(clerkId);

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notification count" },
      { status: 500 }
    );
  }
}
