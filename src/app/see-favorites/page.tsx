import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  getUserfavorites,
  batchIsHouseAvailable,
} from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import Pagination from "@/components/Pagination/Pagination";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  if (!user) {
    return <div>Unauthorized</div>;
  }
  const mongoUser = await getUserByClerkId(user.id);
  if (!mongoUser) {
    return <div>User not found.</div>;
  }

  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page as string)
    : 1;
  const limit = 9;

  const { favorites, totalPages, currentPage } = await getUserfavorites(
    mongoUser._id as string,
    page,
    limit
  );

  if (favorites && favorites.length > 0) {
    // Check real-time availability for all houses in one go
    const houseIds = favorites
      .map((fav: any) => fav.houseId?._id?.toString())
      .filter(Boolean);
    const availabilityMap = await batchIsHouseAvailable(houseIds);

    const housesWithAvailability = favorites.map((fav: any) => {
      const houseObj = fav.houseId?.toObject ? fav.houseId.toObject() : fav.houseId;
      const id = houseObj._id?.toString?.() ?? String(houseObj._id);
      return {
        ...houseObj,
        _id: id,
        ownerId: houseObj.ownerId?.toString?.(),
        images: Array.isArray(houseObj.images) ? houseObj.images : [],
        isAvailable: availabilityMap[id] ?? true,
      };
    });

    return (
      <div>
        <div className="houses-list">
          {housesWithAvailability.map((house) => (
            <HouseLink key={house._id} house={house} />
          ))}
        </div>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    );
  }
  return <div style={{ textAlign: "center" }}>No favorite houses found.</div>;
}
