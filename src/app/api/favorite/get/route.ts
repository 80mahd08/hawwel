import { getfavoritesCount } from "@/lib/dbFunctions";
import { NextRequest, NextResponse } from "next/server";
import logger from "../../../../../services/logger";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("clerkId");

  logger.info(`GET /api/favorite/get for clerkId: ${clerkId}`);

  if (!clerkId) {
    logger.warn("Missing clerkId in /api/favorite/get");
    return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
  }

  try {
    const count = await getfavoritesCount(clerkId);
    logger.info(`Fetched favorites count (${count}) for clerkId: ${clerkId}`);
    return NextResponse.json({ count });
  } catch (error) {
    logger.error("Failed to fetch favorites count", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites count" },
      { status: 500 }
    );
  }
}
