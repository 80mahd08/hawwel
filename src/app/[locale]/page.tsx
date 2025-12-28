import { Metadata } from "next";
import { getAllhouses, getFeaturedHouses, getRecentReviews } from "@/lib/dbFunctions";

export async function generateMetadata({
  searchParams,
  params
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  await params;
  
  const location = resolvedSearchParams.location as string;
  const propertyType = resolvedSearchParams.propertyType as string;

  let title = "Find your perfect stay | hawwel";
  let description = "Book unique homes and experiences all over Tunisia.";

  if (location) {
    title = `${propertyType ? propertyType + 's' : 'Stays'} in ${location} | hawwel`;
    description = `Find the best ${propertyType || 'places to stay'} in ${location}. Book unique homes with hawwel.`;
  } else if (propertyType) {
    title = `${propertyType}s for rent | hawwel`;
    description = `Browse our selection of ${propertyType}s available for rent.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}
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
import { Suspense } from "react";
import HouseListSkeleton from "@/components/Skeleton/HouseListSkeleton";
import FeaturedPropertiesSkeleton from "@/components/Skeleton/FeaturedPropertiesSkeleton";
import RecentReviewsSkeleton from "@/components/Skeleton/RecentReviewsSkeleton";

// --- Async Data Components ---

async function FeaturedSection() {
  const featured = await getFeaturedHouses();
  const houses = (featured as unknown as Ihouse[]).map((h) => ({
    ...h, 
    _id: (h as unknown as { _id: string })._id?.toString() || "",
    location: h.location || "",
    pricePerDay: h.pricePerDay || 0,
    available: h.available ?? true,
    images: h.images || [],
    lat: h.lat ?? undefined,
    lng: h.lng ?? undefined,
  } as unknown as IHouseListing));
  
  return <FeaturedProperties houses={houses} />;
}

async function ReviewsSection() {
  const recent = await getRecentReviews();
  const reviews = (recent as unknown as IReview[]).map((r) => {
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

  return <RecentReviews reviews={reviews} />;
}

async function HousesList({ 
  filters, 
  initialView 
}: { 
  filters: Record<string, string | string[] | number | Date | boolean | undefined>, 
  initialView: "map" | "list" 
}) {
  const { houses: rawHouses, totalPages, currentPage } = await getAllhouses(filters);
  const sortByParam = filters.sortBy as string;
  const isSorting = sortByParam && sortByParam !== 'newest';

  const houses = (rawHouses as unknown as Ihouse[]).map((house) => {
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

  return (
    <HousesView 
      houses={houses}
      totalPages={totalPages}
      currentPage={currentPage}
      initialView={initialView}
      enableMapToggle={!isSorting}
    />
  );
}

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
  const isMapView = !isSorting && viewParam === "map";
  
  const page = isMapView ? 1 : (resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1);
  const limit = isMapView ? 500 : 9;

  const filters = {
    location: resolvedSearchParams.location as string,
    minPrice: resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined,
    maxPrice: resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined,
    amenities: resolvedSearchParams.amenities ? (Array.isArray(resolvedSearchParams.amenities) ? resolvedSearchParams.amenities : [resolvedSearchParams.amenities as string]) : undefined,
    propertyType: resolvedSearchParams.propertyType ? (Array.isArray(resolvedSearchParams.propertyType) ? resolvedSearchParams.propertyType : [resolvedSearchParams.propertyType as string]) : undefined,
    startDate: resolvedSearchParams.startDate ? new Date(resolvedSearchParams.startDate as string) : undefined,
    endDate: resolvedSearchParams.endDate ? new Date(resolvedSearchParams.endDate as string) : undefined,
    onlyAvailable: resolvedSearchParams.onlyAvailable === "true",
    sortBy: sortByParam as "newest" | "price-asc" | "price-desc" | "rating-desc" | undefined,
    page,
    limit,
  };

  const initialView = isMapView ? "map" : "list";
  const isSearching = filters.location || filters.minPrice || filters.maxPrice || filters.amenities || filters.propertyType || filters.startDate || filters.endDate || filters.onlyAvailable || (filters.sortBy && filters.sortBy !== 'newest') || filters.page > 1;

  return (
    <div className="home-page-wrapper">
      <HeroSection />
      
      {!isSearching && (
        <>
          <HowItWorks />
          <Suspense fallback={<FeaturedPropertiesSkeleton />}>
            <FeaturedSection />
          </Suspense>
          <Suspense fallback={<RecentReviewsSkeleton />}>
            <ReviewsSection />
          </Suspense>
          <div className="container" style={{ marginTop: '3rem' }}>
            <h2 className="section-title">{t('subtitle')}</h2>
          </div>
        </>
      )}

      <Suspense key={JSON.stringify(filters)} fallback={<div className="container" style={{ paddingBottom: '4rem' }}><HouseListSkeleton count={filters.limit || 9} /></div>}>
        <HousesList filters={filters} initialView={initialView} />
      </Suspense>
    </div>
  );
}
