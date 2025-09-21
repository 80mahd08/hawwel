import { NextRequest, NextResponse } from "next/server";
import { removeFavori, getUserByClerkId } from "@/lib/dbFunctions";
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

    const result = await removeFavori(user._id, maisonObjectId);

    if (!result) {
      return NextResponse.json(
        { message: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Favorite removed" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error removing favorite:", error);
    return NextResponse.json(
      { message: "Error removing favorite" },
      { status: 500 }
    );
  }
}
