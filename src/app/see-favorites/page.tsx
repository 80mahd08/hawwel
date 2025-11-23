import HouseLink from "@/components/HouseLink/HouseLink";
import { getUserByClerkId, getUserfavorites } from "@/lib/dbFunctions";
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
  const houses = await getUserfavorites(mongoUser._id as string);
  if (houses) {
    logger.info("Favorite houses fetched successfully", {
      userId: mongoUser._id,
      count: houses.length,
    });
    return (
      <div className="houses-list">
        {houses.map((fav) => {
          // fav is a favorite document with a populated `houseId` field
          const populated = (fav as any).houseId;
          const houseObj = populated?.toObject
            ? populated.toObject()
            : populated;

          const plainHouse = {
            ...houseObj,
            _id: houseObj._id?.toString?.() ?? String(houseObj._id),
            ownerId: houseObj.ownerId?.toString?.(),
            images: Array.isArray(houseObj.images) ? houseObj.images : [],
          };

          return <HouseLink key={plainHouse._id} house={plainHouse} />;
        })}
      </div>
    );
  }
  return <div>No favorite houses found.</div>;
}
