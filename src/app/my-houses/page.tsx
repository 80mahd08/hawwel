import HouseLink from "@/components/HouseLink/HouseLink";
import { getUserByClerkId, gethousesByOwner } from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import logger from "../../../services/logger";

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
  const houses = await gethousesByOwner(mongoUser._id as string);
  if (houses) {
    logger.info("my houses fetched successfully", {
      userId: mongoUser._id,
      count: houses.length,
    });
    return (
      <div className="houses-list">
        {houses.map((house) => {
          const obj = house.toObject ? house.toObject() : (house as any);
          const plainHouse = {
            ...obj,
            _id: obj._id?.toString?.() ?? String(obj._id),
            ownerId: obj.ownerId?.toString?.(),
            images: Array.isArray(obj.images) ? obj.images : [],
          };
          return <HouseLink key={plainHouse._id} house={plainHouse} />;
        })}
      </div>
    );
  }
  return <div>No houses found.</div>;
}
