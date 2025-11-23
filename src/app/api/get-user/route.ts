// ============================================
// Imports
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

// ============================================
// GET /api/get-user
// ============================================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  logger.info("📩 GET /api/get-user request", { userId });

  // --- Validate input ---
  if (!userId) {
    logger.warn("⚠️ Missing userId in /api/get-user");
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // --- Fetch user ---
    const user = await getUserByClerkId(userId);

    if (!user) {
      logger.warn("⚠️ User not found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logger.info("✅ User found", { userId });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    logger.error("❌ Server error in /api/get-user", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
