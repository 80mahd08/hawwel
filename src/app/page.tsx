import { getAllhouses, isHouseAvailable } from "@/lib/dbFunctions";
import HouseLink from "@/components/HouseLink/HouseLink";
import SearchFilter from "@/components/SearchFilter/SearchFilter";
import Pagination from "@/components/Pagination/Pagination";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page as string)
    : 1;
  const limit = 9;

  const filters = {
    location: resolvedSearchParams.location as string,
    minPrice: resolvedSearchParams.minPrice
      ? Number(resolvedSearchParams.minPrice)
      : undefined,
    maxPrice: resolvedSearchParams.maxPrice
      ? Number(resolvedSearchParams.maxPrice)
      : undefined,
    amenities: resolvedSearchParams.amenities
      ? Array.isArray(resolvedSearchParams.amenities)
        ? (resolvedSearchParams.amenities as string[])
        : [resolvedSearchParams.amenities as string]
      : undefined,
    startDate: resolvedSearchParams.startDate
      ? new Date(resolvedSearchParams.startDate as string)
      : undefined,
    endDate: resolvedSearchParams.endDate
      ? new Date(resolvedSearchParams.endDate as string)
      : undefined,
    page,
    limit,
  };

  const { houses, totalPages, currentPage } = await getAllhouses(filters);

  // Check real-time availability for each house
  const housesWithRealTimeAvailability = await Promise.all(
    houses.map(async (house) => {
      const isAvailable = await isHouseAvailable(house._id.toString());
      return {
        ...house.toObject(),
        _id: house._id.toString(),
        isAvailable, // This will override the stored 'available' field
      };
    })
  );

  return (
    <div>
      <SearchFilter />
      <div className="houses-list">
        {housesWithRealTimeAvailability.length > 0 ? (
          housesWithRealTimeAvailability.map((house) => (
            <HouseLink key={house._id} house={house} />
          ))
        ) : (
          <div className="no-results">
            <h3>No houses found matching your criteria.</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}
      </div>
      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
