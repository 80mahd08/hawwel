import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  gethousesByOwner,
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

  const houses = await gethousesByOwner(mongoUser._id as string);
  if (houses) {
    // Add real-time availability check
    const housesWithAvailability = await Promise.all(
      houses.map(async (house) => {
        const isAvailable = await isHouseAvailable(house._id.toString());
        const obj = house.toObject ? house.toObject() : (house as any);
        return {
          ...obj,
          _id: obj._id?.toString?.() ?? String(obj._id),
          ownerId: obj.ownerId?.toString?.(),
          images: Array.isArray(obj.images) ? obj.images : [],
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
  return <div>No houses found.</div>;
}
