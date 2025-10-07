import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import {
  createUser,
  updateUserByClerkId,
  deleteUserByClerkId,
  getUserByClerkId,
} from "@/lib/dbFunctions";
import logger from "../../../../services/logger";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    logger.info(`Received webhook event: ${eventType}`);

    // Only handle user events
    if (
      eventType === "user.created" ||
      eventType === "user.updated" ||
      eventType === "user.deleted"
    ) {
      // Type guard: check if evt.data has user fields
      const user = evt.data as Record<string, any>;
      const clerkId = user.id ?? "";
      const email =
        Array.isArray(user.email_addresses) && user.email_addresses[0]
          ? user.email_addresses[0].email_address
          : "";
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

      if (!clerkId) {
        logger.error("Missing Clerk user id in webhook event");
        throw new Error("Missing Clerk user id");
      }

      if (eventType === "user.created") {
        // Check if user already exists
        const existingUser = await getUserByClerkId(clerkId);
        if (!existingUser) {
          await createUser({
            clerkId,
            email,
            name,
            role: "UTILISATEUR",
          });
          logger.info(`Created new user from webhook: ${clerkId}`);
        } else {
          logger.info(`User already exists for clerkId: ${clerkId}`);
        }
      } else if (eventType === "user.updated") {
        await updateUserByClerkId(clerkId, { email, name });
        logger.info(`Updated user from webhook: ${clerkId}`);
      } else if (eventType === "user.deleted") {
        await deleteUserByClerkId(clerkId);
        logger.info(`Deleted user from webhook: ${clerkId}`);
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    logger.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
