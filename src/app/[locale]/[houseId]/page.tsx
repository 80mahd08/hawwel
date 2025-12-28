import { Metadata } from "next";
import {
  getApprovedByHouse,
  gethouseById,
  getUserByClerkId,
  getAvailabilityStatus,
  getReviewsByHouseId,
  canUserReview,
} from "@/lib/dbFunctions";
import HouseSlideshow from "@/components/HouseSlideshow";
import Order from "@/components/Order";
import ReviewsSection from "@/components/ReviewsSection";
import StarRating from "@/components/StarRating";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { currentUser } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import NextImage from "next/image";

interface PageProps {
  params: Promise<{ houseId: string }>;
}

interface House {
  _id: string;
  title: string;
  description: string;
  location: string;
  pricePerDay: number;
  images: string[];
  ownerId: string;
  owner?: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  telephone: string;
  amenities: string[];
  propertyType?: string;
  rating: number;
  available?: boolean;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { houseId } = await params;
  const houseData = await gethouseById(houseId);
  const house = houseData as unknown as House;

  if (!house) {
    return {
      title: "House Not Found | hawwel",
    };
  }

  const title = `${house.title} in ${house.location || "Unknown Location"} | hawwel`;
  const description = house.description
    ? house.description.slice(0, 150) + (house.description.length > 150 ? "..." : "")
    : "Book your next stay with hawwel.";
  const image = house.images?.[0] || "/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const t = await getTranslations('HouseDetails');
  const tSearch = await getTranslations('Search');

  try {
    const { houseId } = await params;

    // Parallelize initial independent fetches
    const [rawHouseData, user, t, tSearch] = await Promise.all([
      gethouseById(houseId),
      currentUser(),
      getTranslations('HouseDetails'),
      getTranslations('Search')
    ]);

    if (!rawHouseData) {
      return (
        <div style={{ textAlign: "center", color: "red", padding: "4rem" }}>
          <h2>{t('notFound')}</h2>
          <p>{t('notFoundDesc')}</p>
        </div>
      );
    }

    const house = rawHouseData as any;
    const ownerId = house.ownerId?._id || house.ownerId;
    const images: string[] = house.images || [];

    // Parallelize user-dependent and secondary house data fetches
    const [rawUser, isAvailable, rawApprovedReservations, rawReviews] = await Promise.all([
      user ? getUserByClerkId(user.id) : null,
      getAvailabilityStatus(houseId),
      getApprovedByHouse(houseId),
      getReviewsByHouseId(houseId)
    ]);

    const currentUserMongoDb = rawUser ? rawUser : null;
    const isOwner = currentUserMongoDb?._id?.toString() === ownerId;

    const approvedReservations = rawApprovedReservations;
    const reviews = rawReviews;
    
    // Final check for review permission
    const canReview = currentUserMongoDb 
      ? await canUserReview((currentUserMongoDb as any)._id.toString(), houseId) 
      : false;

    return (
      <div className="house-details-page">
        <div className="container">
          <div className="house-header">
            <h1 className="house-title">{house.title}</h1>
            <div className="house-meta">
              <span className="location">📍 {house.location || t('locationNotSpecified')}</span>
              {house.propertyType && (
                <span className="property-type">
                  🏠 {tSearch(`propertyTypes.${house.propertyType}`)}
                </span>
              )}
              <span className="rating-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <StarRating rating={house.rating || 0} size={16} /> 
                <span style={{ fontWeight: 600 }}>{house.rating ? house.rating.toFixed(1) : t('new')}</span>
              </span>
            </div>
          </div>

          <HouseSlideshow images={images} />

          <div className="house-content-grid">
            <div className="house-main-info">
              
              {house.ownerId && typeof house.ownerId === 'object' && (
                <div className="info-section host-info" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  paddingBottom: '24px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                    <NextImage 
                      src={house.ownerId.imageUrl || "/default-pfp.png"} 
                      alt={house.ownerId.name || "Host"} 
                      fill
                      sizes="56px"
                      style={{ 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                      priority
                      unoptimized={true}
                    />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 600 }}>
                      {t('hostedBy')} {house.ownerId.name || "Host"}
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                      {t('propertyOwner')}
                    </p>
                  </div>
                </div>
              )}

              <div className="info-section description">
                <h3>{t('aboutThisPlace')}</h3>
                <p>{house.description || t('noDescription')}</p>
              </div>

              <div className="info-section amenities">
                <h3>{t('whatThisPlaceOffers')}</h3>
                {house.amenities && house.amenities.length > 0 ? (
                  <div className="amenities-grid">
                    {house.amenities.map((amenity: string) => (
                      <div key={amenity} className="amenity-item">
                        <span className="amenity-icon">✨</span>
                        <span>{tSearch(`amenitiesList.${amenity.replace(/\s+/g, '')}`)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-amenities">
                    <p>{t('noAmenities')}</p>
                  </div>
                )}
              </div>

              <div className="info-section availability">
                 <AvailabilityCalendar reservedDates={approvedReservations} />
              </div>

              <ReviewsSection 
                houseId={houseId} 
                reviews={reviews} 
                currentUser={currentUserMongoDb} 
                canReview={canReview}
              />
            </div>

            <div className="house-sidebar">
              <div className="booking-card">
                <div className="price-header">
                  <span className="price">{t('currency')} {house.pricePerDay}</span>
                  <span className="period">{t('night')}</span>
                </div>

                {isOwner ? (
                  <div className="owner-message">
                    <p>{t('ownerMessage')}</p>
                  </div>
                ) : currentUserMongoDb ? (
                  <>
                    {!isAvailable && (
                      <div className="unavailable-notice" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.9rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                        {house.available === false 
                          ? t('unavailableNotice')
                          : t('reservedNotice')}
                      </div>
                    )}
                    <Order
                      ownerId={ownerId!}
                      houseId={houseId}
                      buyerId={(currentUserMongoDb as any)._id!.toString()}
                      reservedDates={approvedReservations.map((reservation: { startDate: string | Date; endDate: string | Date }) => ({
                        startDate: new Date(reservation.startDate).toISOString(),
                        endDate: new Date(reservation.endDate).toISOString(),
                      }))}
                    />
                  </>
                ) : (
                  <div className="login-message">
                    <p>{t('loginMessage')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch {
    // Warning: we cannot use t() here easily if it fails, but we can try
    return (
      <div style={{ textAlign: "center", color: "red", padding: "4rem" }}>
        An error occurred while loading the house details.
      </div>
    );
  }
}
