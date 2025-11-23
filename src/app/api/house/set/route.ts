import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, createhouse } from "@/lib/dbFunctions";
import logger from "../../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    logger.info("Received POST /api/set-house request");

    const { userId, houseData } = await req.json();
    logger.info(
      `Request payload: userId=${userId}, houseData=${JSON.stringify(
        houseData
      )}`
    );

    if (!userId) {
      logger.warn("Unauthorized access attempt to /api/set-house");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      logger.warn(`User not found for userId: ${userId}`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    logger.info(`User found: ${userId} with role=${user.role}`);

    if (user.role !== "OWNER") {
      logger.warn(`User ${userId} not authorized to create house`);
      return NextResponse.json(
        { message: "You are not authorized to create a house" },
        { status: 403 }
      );
    }

    logger.info(`Creating house for user ${userId}`);
    const house = await createhouse({
      ...houseData,
      ownerId: user._id,
    });
    logger.info(`house created successfully: houseId=${house._id}`);

    return NextResponse.json({ message: "success", house }, { status: 200 });
  } catch (error: any) {
    logger.error("Error creating house in /api/set-house", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: error.message || "Error creating house" },
      { status: 500 }
    );
  }
}
