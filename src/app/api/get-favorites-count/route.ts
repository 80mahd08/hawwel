import { getFavoritesCount } from "@/lib/dbFunctions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const count = await getFavoritesCount(userId);
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch favorites count" },
      { status: 500 }
    );
  }
}
