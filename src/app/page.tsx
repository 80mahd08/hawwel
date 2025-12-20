import { getAllhouses, batchIsHouseAvailable } from "@/lib/dbFunctions";
import HouseLink from "@/components/HouseLink/HouseLink";
import SearchFilter from "@/components/SearchFilter/SearchFilter";
import Pagination from "@/components/Pagination/Pagination";
import HousesView from "@/components/HousesView/HousesView";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const isMapView = (Array.isArray(resolvedSearchParams.view) ? resolvedSearchParams.view[0] : resolvedSearchParams.view) === "map";
  const page = isMapView ? 1 : (resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1);
  const limit = isMapView ? 500 : 9; // Show more houses on the map
  
  console.log(`Page: view=${isMapView ? "map" : "list"}, page=${page}, limit=${limit}`);

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
    onlyAvailable: resolvedSearchParams.onlyAvailable === "true",
    page,
    limit,
  };

  const { houses: rawHouses, totalPages, currentPage } = await getAllhouses(filters);

  const housesWithRealTimeAvailability = rawHouses.map((house: any) => ({
    ...house,
    _id: house._id.toString(),
  }));

  const initialView = (Array.isArray(resolvedSearchParams.view) ? resolvedSearchParams.view[0] : resolvedSearchParams.view) === "map" ? "map" : "list";

  return (
    <div>
      <SearchFilter />
      <HousesView 
        houses={housesWithRealTimeAvailability}
        totalPages={totalPages}
        currentPage={currentPage}
        initialView={initialView}
      />
    </div>
  );
}
