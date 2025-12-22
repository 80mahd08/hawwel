import HouseLink from "@/components/HouseLink/HouseLink";
import {
  getUserByClerkId,
  gethousesByOwner,
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

  const { houses, totalPages, currentPage } = await gethousesByOwner(
    mongoUser._id as string,
    page,
    limit
  );

  if (houses && houses.length > 0) {
    // Check real-time availability for all houses in one go
    const houseIds = (houses as unknown as { _id: string }[]).map((h) => h._id?.toString() || "");
    const availabilityMap = await batchIsHouseAvailable(houseIds);

    const housesWithAvailability: IHouseListing[] = (houses as unknown as Ihouse[]).map((house) => {
      const id = (house as unknown as { _id: string })._id?.toString() || "";
      return {
        ...house,
        _id: id,
        location: house.location || "",
        pricePerDay: house.pricePerDay || 0,
        available: house.available ?? true,
        ownerId: house.ownerId?.toString(),
        images: Array.isArray(house.images) ? (house.images as string[]) : [],
        isAvailable: availabilityMap[id] ?? true,
        lat: (house.lat ?? undefined) as number | undefined,
        lng: (house.lng ?? undefined) as number | undefined,
      } as unknown as IHouseListing;
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
  return <div style={{ textAlign: "center" }}>No houses found.</div>;
}
