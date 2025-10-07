import { getFavoritesCount } from "@/lib/dbFunctions";
import { NextRequest, NextResponse } from "next/server";
import logger from "../../../../services/logger";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  logger.info(`GET /api/get-favorites-count for userId: ${userId}`);

  if (!userId) {
    logger.warn("Missing userId in /api/get-favorites-count");
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const count = await getFavoritesCount(userId);
    logger.info(`Fetched favorites count (${count}) for userId: ${userId}`);
    return NextResponse.json({ count });
  } catch (error) {
    logger.error("Failed to fetch favorites count", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites count" },
      { status: 500 }
    );
  }
}
