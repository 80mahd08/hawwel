import { getAllhouses, getFeaturedHouses, getRecentReviews } from "@/lib/dbFunctions";
import HouseLink from "@/components/HouseLink/HouseLink";
import SearchFilter from "@/components/SearchFilter/SearchFilter";
import Pagination from "@/components/Pagination/Pagination";
import HousesView from "@/components/HousesView/HousesView";
import HowItWorks from "@/components/Landing/HowItWorks";
import FeaturedProperties from "@/components/Landing/FeaturedProperties";
import RecentReviews from "@/components/Landing/RecentReviews";
import HeroSection from "@/components/Landing/HeroSection";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const sortByParam = resolvedSearchParams.sortBy as string;
  const isSorting = sortByParam && sortByParam !== 'newest';

  const viewParam = Array.isArray(resolvedSearchParams.view) ? resolvedSearchParams.view[0] : resolvedSearchParams.view;
  // Force List View if sorting, otherwise check param
  const isMapView = !isSorting && viewParam === "map";
  
  const page = isMapView ? 1 : (resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1);
  const limit = isMapView ? 500 : 9; // Show more houses on the map
  
  console.log(`Page: view=${isMapView ? "map" : "list"}, page=${page}, limit=${limit}, sorting=${isSorting}`);

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
    propertyType: resolvedSearchParams.propertyType
      ? Array.isArray(resolvedSearchParams.propertyType)
        ? (resolvedSearchParams.propertyType as string[])
        : [resolvedSearchParams.propertyType as string]
      : undefined,
    startDate: resolvedSearchParams.startDate
      ? new Date(resolvedSearchParams.startDate as string)
      : undefined,
    endDate: resolvedSearchParams.endDate
      ? new Date(resolvedSearchParams.endDate as string)
      : undefined,
    onlyAvailable: resolvedSearchParams.onlyAvailable === "true",
    sortBy: sortByParam,
    page,
    limit,
  };

  const { houses: rawHouses, totalPages, currentPage } = await getAllhouses(filters);

  const housesWithRealTimeAvailability = rawHouses.map((house: any) => ({
    ...house,
    _id: house._id.toString(),
  }));

  const initialView = isMapView ? "map" : "list";

  // Check if users are searching or filtering. If NOT, show landing page sections.
  const isSearching = 
    filters.location || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.amenities || 
    filters.propertyType || 
    filters.startDate || 
    filters.endDate || 
    filters.onlyAvailable || 
    (filters.sortBy && filters.sortBy !== 'newest') ||
    filters.page > 1;

  let featuredHouses: any[] = [];
  let recentReviews: any[] = [];

  if (!isSearching) {
    featuredHouses = await getFeaturedHouses();
    recentReviews = await getRecentReviews();
    
    // Convert IDs for frontend components if needed (simple fix for objectId issues)
    featuredHouses = featuredHouses.map((h: any) => ({...h, _id: h._id.toString()}));
    recentReviews = recentReviews.map((r: any) => ({
      ...r, 
      _id: r._id.toString(),
      houseId: r.houseId ? {...r.houseId, _id: r.houseId._id.toString()} : null 
    }));
  }

  return (
    <div className="home-page-wrapper">
      <HeroSection />
      
      {!isSearching && (
        <>
          <HowItWorks />
          <FeaturedProperties houses={featuredHouses} />
          <RecentReviews reviews={recentReviews} />
          <div className="container" style={{ marginTop: '3rem' }}>
            <h2 className="section-title">All Listings</h2>
          </div>
        </>
      )}

      <HousesView 
        houses={housesWithRealTimeAvailability}
        totalPages={totalPages}
        currentPage={currentPage}
        initialView={initialView}
        enableMapToggle={!isSorting}
      />
    </div>
  );
}
