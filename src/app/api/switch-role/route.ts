// ============================================
// Imports
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { updateRoleToOwner } from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

// ============================================
// POST /api/change-role
// ============================================
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    logger.info(`📩 POST /api/change-role request`, { userId });

    // --- Validate input ---
    if (!userId) {
      logger.warn("⚠️ Missing userId in request body");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- Update role ---
    const updatedUser = await updateRoleToOwner(userId);
    if (!updatedUser) {
      logger.warn(`⚠️ User not found or role update failed`, { userId });
      return NextResponse.json(
        { message: "User not found or role not updated", user: null },
        { status: 404 }
      );
    }

    logger.info(`✅ Role updated to PROPRIETAIRE`, { userId });

    return NextResponse.json(
      { message: "Role updated to PROPRIETAIRE", user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("❌ Error updating role in /api/change-role", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { message: "Error updating role" },
      { status: 500 }
    );
  }
}
