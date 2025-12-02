import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  getUserfavorites,
  isHouseAvailable,
} from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";

export default async function page() {
  const user = await currentUser();
  if (!user) {
    return <div>Unauthorized</div>;
  }
  const mongoUser = await getUserByClerkId(user.id);
  if (!mongoUser) {
    return <div>User not found.</div>;
  }

  const houses = await getUserfavorites(mongoUser._id as string);
  if (houses) {
    // Add real-time availability check
    const housesWithAvailability = await Promise.all(
      houses.map(async (fav) => {
        const populated = (fav as any).houseId;
        const houseObj = populated?.toObject ? populated.toObject() : populated;
        const isAvailable = await isHouseAvailable(houseObj._id.toString());

        return {
          ...houseObj,
          _id: houseObj._id?.toString?.() ?? String(houseObj._id),
          ownerId: houseObj.ownerId?.toString?.(),
          images: Array.isArray(houseObj.images) ? houseObj.images : [],
          isAvailable, // Add real-time availability
        };
      })
    );

    return (
      <div className="houses-list">
        {housesWithAvailability.map((house) => (
          <HouseLink key={house._id} house={house} />
        ))}
      </div>
    );
  }
  return <div>No favorite houses found.</div>;
}
