import DispPending from "@/components/DispPending/DispPending";
import { getPendingByOwner, getUserByClerkId } from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import logger from "../../../services/logger";
import { usePendingCount } from "@/context/PendingCountProvider";

export default async function page() {
  const user = await currentUser();
  if (!user) {
    logger.warn("Unauthorized access attempt");
    return <div>Unauthorized</div>;
  }
  const mongoUser = await getUserByClerkId(user.id);
  if (!mongoUser) {
    logger.warn("User not found in DB", { clerkId: user.id }); // 👈 logger
    return <div>User not found.</div>;
  }

  logger.info("Fetching pendings for owner", { ownerId: mongoUser._id }); // 👈 logger

  const pendings = await getPendingByOwner(mongoUser._id.toString());

  if (pendings) {
    logger.info("Pendings fetched successfully", {
      ownerId: mongoUser._id,
      count: pendings.length,
    });

    return (
      <div className="container my-pending">
        {pendings.map((pending) => (
          <DispPending key={pending._id} pending={pending} />
        ))}
      </div>
    );
  }
  return <div>No pending requests found.</div>;
}
