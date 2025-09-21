import { NextRequest, NextResponse } from "next/server";
import { addFavori, getUserByClerkId } from "@/lib/dbFunctions";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { userId, maisonId } = await req.json();

    if (!userId || !maisonId) {
      return NextResponse.json(
        { message: "Missing userId or maisonId" },
        { status: 400 }
      );
    }

    // Find user by Clerk ID and get their MongoDB _id
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // maisonId should be a valid ObjectId string
    if (!Types.ObjectId.isValid(maisonId)) {
      return NextResponse.json(
        { message: "Invalid maisonId" },
        { status: 400 }
      );
    }

    const maisonObjectId = new Types.ObjectId(maisonId);

    const favori = await addFavori(user._id, maisonObjectId);

    return NextResponse.json(
      { message: "Favorite added", favori },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error adding favorite:", error);
    return NextResponse.json(
      { message: "Error adding favorite" },
      { status: 500 }
    );
  }
}
