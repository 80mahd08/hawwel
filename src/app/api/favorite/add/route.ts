import { NextRequest, NextResponse } from "next/server";
import { addfavorite, getUserByClerkId } from "@/lib/dbFunctions";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { userId, houseId } = await req.json();

    if (!userId || !houseId) {
      return NextResponse.json(
        { message: "Missing userId or houseId" },
        { status: 400 }
      );
    }

    // Find user by Clerk ID and get their MongoDB _id
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // houseId should be a valid ObjectId string
    if (!Types.ObjectId.isValid(houseId)) {
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
    return NextResponse.json(
      { message: "favoritete added", favorite: favoriteResult.favorite },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error adding favoritete" },
      { status: 500 }
    );
  }
}
