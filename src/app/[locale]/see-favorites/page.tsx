import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  getUserfavorites,
  batchIsHouseAvailable,
} from "@/lib/dbFunctions";
import { currentUser } from "@clerk/nextjs/server";
import Pagination from "@/components/Pagination/Pagination";
import { IHouseListing } from "@/components/HousesView/HousesView";
import { Ihouse } from "@/models/house";

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
    const houseIds = (favorites as unknown as { houseId: { _id: string } }[])
      .map((fav) => fav.houseId?._id?.toString() || String(fav.houseId?._id))
      .filter((id): id is string => !!id && id !== "undefined");
    const availabilityMap = await batchIsHouseAvailable(houseIds);

    const housesWithAvailability = (favorites as unknown as { houseId: Ihouse }[]).map((fav) => {
      const houseObj = fav.houseId;
      const id = (houseObj as unknown as { _id: string })._id?.toString() || "";
      return {
        ...houseObj,
        _id: id,
        location: houseObj?.location || "",
        pricePerDay: houseObj?.pricePerDay || 0,
        available: houseObj?.available ?? true,
        ownerId: houseObj?.ownerId?.toString(),
        images: Array.isArray(houseObj?.images) ? (houseObj.images as string[]) : [],
        isAvailable: availabilityMap[id] ?? true,
        lat: (houseObj?.lat ?? undefined) as number | undefined,
        lng: (houseObj?.lng ?? undefined) as number | undefined,
      } as unknown as IHouseListing & { isAvailable: boolean };
    });

    return (
      <div>
        <div className="houses-list">
          {housesWithAvailability.map((house) => (
            <HouseLink key={house._id} house={JSON.parse(JSON.stringify(house))} />
          ))}
        </div>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    );
  }
  return <div style={{ textAlign: "center" }}>No favorite houses found.</div>;
}
