import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  gethousesByOwner,
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

  const { houses, totalPages, currentPage } = await gethousesByOwner(
    mongoUser._id as string,
    page,
    limit
  );

  if (houses && houses.length > 0) {
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
  return <div>No houses found.</div>;
}
