import { NextRequest, NextResponse } from "next/server";
import { addAvis } from "@/lib/dbFunctions";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { maisonId, comment, rating } = await req.json();
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ clerkId: userId });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const avis = await addAvis(
      user._id as Types.ObjectId,
      maisonId,
      comment,
      rating
    );
    return NextResponse.json(avis);
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
