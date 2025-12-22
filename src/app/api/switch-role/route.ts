// ============================================
// Imports
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { updateRoleToOwner } from "@/lib/dbFunctions";

// ============================================
// POST /api/change-role
// ============================================
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    // --- Validate input ---
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // --- Update role ---
    const updatedUser = await updateRoleToOwner(userId);
    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found or role not updated", user: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Role updated to PROPRIETAIRE", user: updatedUser },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error).message || "Error updating role" },
      { status: 500 }
    );
  }
}
