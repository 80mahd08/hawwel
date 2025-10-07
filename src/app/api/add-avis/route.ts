import { NextRequest, NextResponse } from "next/server";
import { addAvis } from "@/lib/dbFunctions";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import { Types } from "mongoose";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { maisonId, comment, rating } = await req.json();
    const { userId } = await auth();
    logger.info(`POST /api/add-avis by user: ${userId}, maisonId: ${maisonId}`);

    if (!userId) {
      logger.warn("Unauthorized access attempt to /api/add-avis");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      logger.warn(`User not found for clerkId: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const avis = await addAvis(
      user._id as Types.ObjectId,
      maisonId,
      comment,
      rating
    );
    logger.info(`Avis added by user ${userId} for maison ${maisonId}`);
    return NextResponse.json(avis);
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred";
    logger.error("Error in POST /api/add-avis", e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
