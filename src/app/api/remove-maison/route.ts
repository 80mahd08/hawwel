import { NextRequest, NextResponse } from "next/server";
import { deleteMaison } from "@/lib/dbFunctions";
import { Types } from "mongoose";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const { maisonId } = await req.json();

    if (!maisonId || !Types.ObjectId.isValid(maisonId)) {
      logger.warn("Invalid or missing maisonId in /api/remove-maison");
      return NextResponse.json(
        { message: "Invalid or missing maisonId" },
        { status: 400 }
      );
    }

    const maisonObjectId = new Types.ObjectId(maisonId);
    const result = await deleteMaison(maisonObjectId);

    if (!result) {
      logger.warn(`Maison not found for maisonId: ${maisonId}`);
      return NextResponse.json(
        { message: "Maison not found" },
        { status: 404 }
      );
    }

    logger.info(`Maison removed: ${maisonId}`);
    return NextResponse.json({ message: "Maison removed" }, { status: 200 });
  } catch (error) {
    logger.error("Error removing maison in /api/remove-maison", error);
    return NextResponse.json(
      { message: "Error removing maison" },
      { status: 500 }
    );
  }
}
