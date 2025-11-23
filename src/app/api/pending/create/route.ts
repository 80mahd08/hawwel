import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId, createPending } from "@/lib/dbFunctions";
import logger from "../../../../../services/logger";
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      logger.warn("Unauthorized POST /pending attempt");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const houseId = body?.houseId;
    const ownerId = body?.ownerId;

    logger.info("Incoming pending create request", {
      clerkId: user.id,
      houseId,
      ownerId,
    });

    if (!houseId) {
      logger.warn("houseId missing in request body");
      return NextResponse.json(
        { message: "houseId is required" },
        { status: 400 }
      );
    }

    const mongoUser = await getUserByClerkId(user.id);
    if (!mongoUser) {
      logger.error("User not found in DB", { clerkId: user.id });
      return NextResponse.json(
        { message: "User not found in database" },
        { status: 404 }
      );
    }

    logger.info("Creating pending", {
      buyerId: mongoUser._id.toString(),
      ownerId,
      houseId,
    });

    const pending = await createPending({
      buyerId: mongoUser._id.toString(),
      ownerId,
      houseId,
    });

    logger.info("Pending created successfully", {
      pendingId: pending._id,
      buyerId: mongoUser._id.toString(),
      ownerId,
      houseId,
    });

    return NextResponse.json(
      { message: "Pending created", pending },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("❌ Error creating pending", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      { message: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
