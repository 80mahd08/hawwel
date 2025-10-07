import { NextRequest, NextResponse } from "next/server";
import { updateRoleToProprietaire } from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    logger.info(`POST /api/change-role for user: ${userId}`);

    if (!userId) {
      logger.warn("Unauthorized access attempt to /api/change-role");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await updateRoleToProprietaire(userId);
    if (!user) {
      logger.warn(`User not found or role not updated for user: ${userId}`);
      return NextResponse.json(
        { message: "User not found or role not updated", user: null },
        { status: 404 }
      );
    }
    logger.info(`Role updated to proprietaire for user: ${userId}`);

    return NextResponse.json(
      { message: "Role updated to proprietaire", user: user },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error updating role in /api/change-role", error);
    return NextResponse.json(
      { message: "Error updating role" },
      { status: 500 }
    );
  }
}
