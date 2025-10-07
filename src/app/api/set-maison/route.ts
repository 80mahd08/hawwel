import { NextRequest, NextResponse } from "next/server";
import { getUserByClerkId, createMaison } from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    logger.info("Received POST /api/set-maison request");

    const { userId, maisonData } = await req.json();
    logger.info(
      `Request payload: userId=${userId}, maisonData=${JSON.stringify(
        maisonData
      )}`
    );

    if (!userId) {
      logger.warn("Unauthorized access attempt to /api/set-maison");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      logger.warn(`User not found for userId: ${userId}`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    logger.info(`User found: ${userId} with role=${user.role}`);

    if (user.role !== "PROPRIETAIRE") {
      logger.warn(`User ${userId} not authorized to create maison`);
      return NextResponse.json(
        { message: "You are not authorized to create a maison" },
        { status: 403 }
      );
    }

    logger.info(`Creating maison for user ${userId}`);
    const maison = await createMaison({
      ...maisonData,
      ownerId: user._id,
    });
    logger.info(`Maison created successfully: maisonId=${maison._id}`);

    return NextResponse.json({ message: "success", maison }, { status: 200 });
  } catch (error: any) {
    logger.error("Error creating maison in /api/set-maison", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: error.message || "Error creating maison" },
      { status: 500 }
    );
  }
}
