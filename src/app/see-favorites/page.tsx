import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  getUserfavorites,
  isHouseAvailable,
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
    // Add real-time availability check
    const housesWithAvailability = await Promise.all(
      favorites.map(async (fav) => {
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
  return <div>No favorite houses found.</div>;
}
