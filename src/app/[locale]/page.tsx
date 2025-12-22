import { getAllhouses, getFeaturedHouses, getRecentReviews } from "@/lib/dbFunctions";
import HousesView from "@/components/HousesView/HousesView";
import HowItWorks from "@/components/Landing/HowItWorks";
import FeaturedProperties from "@/components/Landing/FeaturedProperties";
import RecentReviews from "@/components/Landing/RecentReviews";
import HeroSection from "@/components/Landing/HeroSection";
import { getTranslations } from "next-intl/server";
import { Ihouse } from "@/models/house";
import { IReview } from "@/models/Review";
import { IHouseListing } from "@/components/HousesView/HousesView";
import { IUser } from "@/models/User";

export default async function HomePage({
  searchParams,
  params
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});
  
  const sortByParam = resolvedSearchParams.sortBy as string;
  const isSorting = sortByParam && sortByParam !== 'newest';

  const viewParam = Array.isArray(resolvedSearchParams.view) ? resolvedSearchParams.view[0] : resolvedSearchParams.view;
  // Force List View if sorting, otherwise check param
  const isMapView = !isSorting && viewParam === "map";
  
  const page = isMapView ? 1 : (resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1);
  const limit = isMapView ? 500 : 9; // Show more houses on the map

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
    sortBy: sortByParam as "newest" | "price-asc" | "price-desc" | "rating-desc" | undefined,
    page,
    limit,
  };

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

  let featuredHouses: IHouseListing[] = [];
  let recentReviews: (IReview & { _id: string; userId?: IUser; houseId?: Ihouse & { _id: string } })[] = [];

  // Parallelize the two main data fetch paths (Search vs Landing Home)
  const [housesData, landingData] = await Promise.all([
    getAllhouses(filters),
    !isSearching 
      ? Promise.all([getFeaturedHouses(), getRecentReviews()])
      : Promise.resolve([[], []])
  ]);

  const { houses: rawHouses, totalPages, currentPage } = housesData;
  const [rawFeatured, rawRecent] = landingData;

  const housesWithRealTimeAvailability: IHouseListing[] = (rawHouses as unknown as Ihouse[]).map((house) => {
    const id = (house as unknown as { _id: string })._id?.toString() || "";
    return {
      ...house,
      _id: id,
      location: house.location || "",
      pricePerDay: house.pricePerDay || 0,
      available: house.available ?? true,
      images: house.images || [],
      lat: house.lat ?? undefined,
      lng: house.lng ?? undefined,
    } as unknown as IHouseListing;
  });

  if (!isSearching) {
    // Convert IDs for frontend components if needed (simple fix for objectId issues)
    featuredHouses = (rawFeatured as unknown as Ihouse[]).map((h) => ({
      ...h, 
      _id: (h as unknown as { _id: string })._id?.toString() || "",
      location: h.location || "",
      pricePerDay: h.pricePerDay || 0,
      available: h.available ?? true,
      images: h.images || [],
      lat: h.lat ?? undefined,
      lng: h.lng ?? undefined,
    } as unknown as IHouseListing));

    recentReviews = (rawRecent as unknown as IReview[]).map((r) => {
        const reviewId = (r as unknown as { _id: string })._id?.toString() || "";
        const houseData = r.houseId ? {
            ...(r.houseId as unknown as Ihouse),
            _id: (r.houseId as unknown as { _id: string })._id?.toString() || ""
        } : undefined;

        return {
            ...r,
            _id: reviewId,
            houseId: houseData
        } as unknown as (IReview & { _id: string; userId?: IUser; houseId?: Ihouse & { _id: string } });
    });
  }

  return (
    <div className="home-page-wrapper">
      <HeroSection />
      
      {!isSearching && (
        <>
          <HowItWorks />
          <FeaturedProperties houses={JSON.parse(JSON.stringify(featuredHouses))} />
          <RecentReviews reviews={JSON.parse(JSON.stringify(recentReviews))} />
          <div className="container" style={{ marginTop: '3rem' }}>
            <h2 className="section-title">{t('subtitle')}</h2>
          </div>
        </>
      )}

      <HousesView 
        houses={JSON.parse(JSON.stringify(housesWithRealTimeAvailability))}
        totalPages={totalPages}
        currentPage={currentPage}
        initialView={initialView}
        enableMapToggle={!isSorting}
      />
    </div>
  );
}
