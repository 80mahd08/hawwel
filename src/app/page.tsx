import { getAllhouses, isHouseAvailable } from "@/lib/dbFunctions";
import HouseLink from "@/components/HouseLink/HouseLink";
export default async function page() {
  const housesData = await getAllhouses();

  // Check real-time availability for each house
  const housesWithRealTimeAvailability = await Promise.all(
    housesData.map(async (house) => {
      const isAvailable = await isHouseAvailable(house._id.toString());
      return {
        ...house.toObject(),
        _id: house._id.toString(),
        isAvailable, // This will override the stored 'available' field
      };
    })
  );

  return (
    <div className="houses-list">
      {housesWithRealTimeAvailability.map((house) => (
        <HouseLink key={house._id} house={house} />
      ))}
    </div>
  );
}
