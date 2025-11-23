import { NextRequest, NextResponse } from "next/server";
import { addfavorite, getUserByClerkId } from "@/lib/dbFunctions";
import { Types } from "mongoose";
import logger from "../../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId, houseId } = await req.json();
    logger.info(`POST /api/add-fav by user: ${userId}, houseId: ${houseId}`);

    if (!userId || !houseId) {
      logger.warn("Missing userId or houseId in /api/add-fav");
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

    const favoriteResult = await addfavorite(user._id, houseId);

    if (favoriteResult.alreadyExists) {
      return NextResponse.json(
        {
          message: "Favorite already exists",
          favorite: favoriteResult.favorite,
        },
        { status: 200 }
      );
    }
    logger.info(`favoritete added for user ${userId} and house ${houseId}`);
    return NextResponse.json(
      { message: "favoritete added", favorite: favoriteResult.favorite },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error adding favoritete in /api/add-fav", error);
    return NextResponse.json(
      { message: "Error adding favoritete" },
      { status: 500 }
    );
  }
}
