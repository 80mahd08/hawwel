import { Metadata } from "next";
import {
  getApprovedByHouse,
  gethouseById,
  getUserByClerkId,
  getAvailabilityStatus,
} from "@/lib/dbFunctions";
import HouseSlideshow from "@/components/HouseSlideshow";
import Order from "@/components/Order";
import { currentUser } from "@clerk/nextjs/server";

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
  ownerId: any;
  telephone: string;
  amenities: string[];
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
      images: [image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  try {
    const { houseId } = await params;

    // Fetch house data
    const houseData = await gethouseById(houseId);
    if (!houseData) {
      return (
        <div style={{ textAlign: "center", color: "red", padding: "4rem" }}>
          <h2>House not found</h2>
          <p>The property you're looking for might have been removed or doesn't exist.</p>
        </div>
      );
    }

    const house = houseData as unknown as House;

    // Check real-time availability using the unified helper
    const isAvailable = await getAvailabilityStatus(houseId);

    // Fetch current user from Clerk
    const user = await currentUser();
    const currentUserMongoDb = user ? await getUserByClerkId(user.id) : null;

    const ownerId = house.ownerId?.toString();
    const images: string[] = house.images || [];

    // FIX: Correct owner check (was backwards)
    const isOwner = currentUserMongoDb?._id?.toString() === ownerId;

    const approvedReservations = await getApprovedByHouse(houseId);

    return (
      <div className="house-details-page">
        <div className="container">
          <div className="house-header">
            <h1 className="house-title">{house.title}</h1>
            <div className="house-meta">
              <span className="location">📍 {house.location || "Location not specified"}</span>
              {/* @ts-ignore */}
              {house.available === false ? (
                <span className="status-badge unavailable delisted">Delisted</span>
              ) : isAvailable ? (
                <span className="status-badge available">Available</span>
              ) : (
                <span className="status-badge unavailable reserved">Reserved</span>
              )}
            </div>
          </div>

          <HouseSlideshow images={images} />

          <div className="house-content-grid">
            <div className="house-main-info">
              <div className="info-section description">
                <h3>About this place</h3>
                <p>{house.description || "No description available."}</p>
              </div>

              <div className="info-section amenities">
                <h3>What this place offers</h3>
                {house.amenities && house.amenities.length > 0 ? (
                  <div className="amenities-grid">
                    {house.amenities.map((amenity: string) => (
                      <div key={amenity} className="amenity-item">
                        <span className="amenity-icon">✨</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-amenities">
                    <p>No specific amenities listed for this property.</p>
                  </div>
                )}
              </div>

              {approvedReservations.length > 0 && (
                <div className="info-section reservations">
                  <h3>Reserved Dates</h3>
                  <div className="dates-list">
                    {approvedReservations.map((reservation: any) => (
                      <div key={reservation._id} className="date-badge">
                        {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                        {new Date(reservation.endDate).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="house-sidebar">
              <div className="booking-card">
                <div className="price-header">
                  <span className="price">DT {house.pricePerDay}</span>
                  <span className="period">/ night</span>
                </div>

                {isOwner ? (
                  <div className="owner-message">
                    <p>You are the owner of this listing.</p>
                  </div>
                ) : currentUserMongoDb ? (
                  <>
                    {!isAvailable && (
                      <div className="unavailable-notice" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.9rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                        {/* @ts-ignore */}
                        {house.available === false 
                          ? "⚠️ This property is currently not accepting new bookings."
                          : "⚠️ This property is reserved for these dates, but you can check other availability."}
                      </div>
                    )}
                    <Order
                      ownerId={ownerId!}
                      houseId={houseId}
                      buyerId={currentUserMongoDb._id!.toString()}
                      reservedDates={approvedReservations.map((reservation: any) => ({
                        startDate: reservation.startDate,
                        endDate: reservation.endDate,
                      }))}
                    />
                  </>
                ) : (
                  <div className="login-message">
                    <p>Please log in to book this property.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Error in Page:", error);
    return (
      <div style={{ textAlign: "center", color: "red", padding: "4rem" }}>
        An error occurred while loading the house details.
      </div>
    );
  }
}
