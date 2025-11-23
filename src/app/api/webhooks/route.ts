// ============================================
// Imports
// ============================================
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import {
  createUser,
  updateUserByClerkId,
  deleteUserByClerkId,
  getUserByClerkId,
} from "@/lib/dbFunctions";
import logger from "../../../../services/logger";
import house from "@/models/house";
import favorite from "@/models/favorite";
import Pending from "@/models/Pending";

// ============================================
// Webhook Handler
// ============================================
export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);
    const { type, data } = event;

    logger.info(`📩 Webhook event received: ${type}`);

    // Handle only user events
    if (!["user.created", "user.updated", "user.deleted"].includes(type)) {
      logger.info(`⚪ Ignored non-user event: ${type}`);
      return new Response("Ignored event", { status: 200 });
    }

    const user = data as Record<string, any>;
    const clerkId = user.id ?? "";
    const email = user.email_addresses?.[0]?.email_address ?? "";
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

    if (!clerkId) {
      logger.error("❌ Missing Clerk user id in webhook event");
      return new Response("Missing Clerk ID", { status: 400 });
    }

    switch (type) {
      case "user.created":
        await handleUserCreated(clerkId, email, name);
        break;

      case "user.updated":
        await handleUserUpdated(clerkId, email, name);
        break;

      case "user.deleted":
        await handleUserDeleted(clerkId);
        break;
    }

    return new Response("✅ Webhook processed", { status: 200 });
  } catch (error) {
    logger.error("❌ Error verifying webhook", {
      message: (error as any).message,
    });
    return new Response("Error verifying webhook", { status: 400 });
  }
}

// ============================================
// Event Handlers
// ============================================
async function handleUserCreated(clerkId: string, email: string, name: string) {
  const existingUser = await getUserByClerkId(clerkId);
  if (existingUser) {
    logger.info(`ℹ️ User already exists for clerkId: ${clerkId}`);
    return;
  }

  await createUser({ clerkId, email, name, role: "USER" });
  logger.info(`🆕 Created new user from webhook: ${clerkId}`);
}

async function handleUserUpdated(clerkId: string, email: string, name: string) {
  await updateUserByClerkId(clerkId, { email, name });
  logger.info(`🔄 Updated user from webhook: ${clerkId}`);
}

async function handleUserDeleted(clerkId: string) {
  try {
    logger.info(`🗑 Starting full deletion for user clerkId: ${clerkId}`);

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      logger.warn(`⚠️ No user found in DB for clerkId: ${clerkId}`);
      return;
    }

    const userId = user._id.toString();

    await house.deleteMany({ ownerId: userId });

    await favorite.deleteMany({ userId });

    await Pending.deleteMany({ buyerId: userId });

    await deleteUserByClerkId(clerkId);

    logger.info(`🧹 Full cleanup done for user: ${clerkId}`);
  } catch (error) {
    logger.error("❌ Error in handleUserDeleted cleanup", {
      clerkId,
      message: (error as any).message,
    });
    throw error;
  }
}
