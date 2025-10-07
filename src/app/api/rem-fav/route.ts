import { NextRequest, NextResponse } from "next/server";
import { removeFavori, getUserByClerkId } from "@/lib/dbFunctions";
import { Types } from "mongoose";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId, maisonId } = await req.json();
    logger.info(`POST /api/rem-fav by user: ${userId}, maisonId: ${maisonId}`);

    if (!userId || !maisonId) {
      logger.warn("Missing userId or maisonId in /api/rem-fav");
      return NextResponse.json(
        { message: "Missing userId or maisonId" },
        { status: 400 }
      );
    }

    // Find user by Clerk ID and get their MongoDB _id
    const user = await getUserByClerkId(userId);
    if (!user) {
      logger.warn(`User not found for clerkId: ${userId}`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // maisonId should be a valid ObjectId string
    if (!Types.ObjectId.isValid(maisonId)) {
      logger.warn(`Invalid maisonId: ${maisonId}`);
      return NextResponse.json(
        { message: "Invalid maisonId" },
        { status: 400 }
      );
    }

    const maisonObjectId = new Types.ObjectId(maisonId);

    const result = await removeFavori(user._id, maisonObjectId);

    if (!result) {
      logger.warn(
        `Favorite not found for user: ${userId}, maison: ${maisonId}`
      );
      return NextResponse.json(
        { message: "Favorite not found" },
        { status: 404 }
      );
    }

    logger.info(`Favorite removed for user: ${userId}, maison: ${maisonId}`);
    return NextResponse.json({ message: "Favorite removed" }, { status: 200 });
  } catch (error) {
    logger.error("Error removing favorite in /api/rem-fav", error);
    return NextResponse.json(
      { message: "Error removing favorite" },
      { status: 500 }
    );
  }
}
