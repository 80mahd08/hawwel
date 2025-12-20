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

    // Handle only user events
    if (!["user.created", "user.updated", "user.deleted"].includes(type)) {
      return new Response("Ignored event", { status: 200 });
    }

    const user = data as Record<string, any>;
    const clerkId = user.id ?? "";
    const email = user.email_addresses?.[0]?.email_address ?? "";
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
    const imageUrl = user.image_url ?? "";

    if (!clerkId) {
      return new Response("Missing Clerk ID", { status: 400 });
    }

    switch (type) {
      case "user.created":
        await handleUserCreated(clerkId, email, name, imageUrl);
        break;

      case "user.updated":
        await handleUserUpdated(clerkId, email, name, imageUrl);
        break;

      case "user.deleted":
        await handleUserDeleted(clerkId);
        break;
    }

    return new Response("✅ Webhook processed", { status: 200 });
  } catch (error) {
    return new Response("Error verifying webhook", { status: 400 });
  }
}

// ============================================
// Event Handlers
// ============================================
async function handleUserCreated(clerkId: string, email: string, name: string, imageUrl: string) {
  const existingUser = await getUserByClerkId(clerkId);
  if (existingUser) {
    return;
  }

  await createUser({ clerkId, email, name, imageUrl, role: "USER" });
}

async function handleUserUpdated(clerkId: string, email: string, name: string, imageUrl: string) {
  await updateUserByClerkId(clerkId, { email, name, imageUrl });
}

async function handleUserDeleted(clerkId: string) {
  try {
    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return;
    }

    const userId = user._id.toString();

    await house.deleteMany({ ownerId: userId });

    await favorite.deleteMany({ userId });

    await Pending.deleteMany({ buyerId: userId });

    await deleteUserByClerkId(clerkId);
  } catch (error) {
    throw error;
  }
}
