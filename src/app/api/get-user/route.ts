// ============================================
// Imports
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/dbFunctions";

// ============================================
// GET /api/get-user
// ============================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  // --- Validate input ---
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // --- Fetch user ---
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

