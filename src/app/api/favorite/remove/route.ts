import { NextRequest, NextResponse } from "next/server";
import { removefavorite, getUserByClerkId } from "@/lib/dbFunctions";
import { Types } from "mongoose";
import logger from "../../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId, houseId } = await req.json();
    logger.info(`POST /api/rem-fav by user: ${userId}, houseId: ${houseId}`);

    if (!userId || !houseId) {
      logger.warn("Missing userId or houseId in /api/rem-fav");
      return NextResponse.json(
        { message: "Missing userId or houseId" },
        { status: 400 }
      );
    }

    // Find user by Clerk ID and get their MongoDB _id
    const user = await getUserByClerkId(userId);
    if (!user) {
      logger.warn(`User not found for clerkId: ${userId}`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // houseId should be a valid ObjectId string
    if (!Types.ObjectId.isValid(houseId)) {
      logger.warn(`Invalid houseId: ${houseId}`);
      return NextResponse.json({ message: "Invalid houseId" }, { status: 400 });
    }

    const result = await removefavorite(user._id, houseId);

    if (!result) {
      logger.warn(
        `favoritete not found for user: ${userId}, house: ${houseId}`
      );
      return NextResponse.json(
        { message: "favoritete not found" },
        { status: 404 }
      );
    }

    logger.info(`favoritete removed for user: ${userId}, house: ${houseId}`);
    return NextResponse.json(
      { message: "favoritete removed" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error removing favoritete in /api/rem-fav", error);
    return NextResponse.json(
      { message: "Error removing favoritete" },
      { status: 500 }
    );
  }
}
