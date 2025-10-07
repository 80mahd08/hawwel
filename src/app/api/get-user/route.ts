import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  logger.info(`GET /api/get-user for userId: ${userId}`);

  if (!userId) {
    logger.warn("Missing userId in /api/get-user");
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const user = await getUserByClerkId(userId);
    if (!user) {
      logger.warn(`User not found for userId: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    logger.info(`User found for userId: ${userId}`);
    return NextResponse.json({ user });
  } catch (error) {
    logger.error("Server error in /api/get-user", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
