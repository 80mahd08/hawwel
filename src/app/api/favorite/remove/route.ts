import { NextRequest, NextResponse } from "next/server";
import { removefavorite, getUserByClerkId } from "@/lib/dbFunctions";
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

    const result = await removefavorite(user._id, houseId);

    if (!result) {
      return NextResponse.json(
        { message: "favoritete not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "favoritete removed" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error).message || "Error removing favoritete" },
      { status: 500 }
    );
  }
}
