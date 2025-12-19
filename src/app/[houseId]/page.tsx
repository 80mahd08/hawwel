import {
  getApprovedByHouse,
  gethouseById,
  getUserByClerkId,
  isHouseAvailable, // ADD THIS
} from "@/lib/dbFunctions";
import HouseSlideshow from "@/components/HouseSlideshow";
import Order from "@/components/Order";
import { currentUser } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ houseId: string }>;
}

export default async function Page({ params }: PageProps) {
  try {
    const { houseId } = await params;

    // Fetch house data
    const house = await gethouseById(houseId);
    if (!house) {
      return (
        <div style={{ textAlign: "center", color: "red" }}>
          House not found.
        </div>
      );
    }

    // Check real-time availability
    const isAvailable = await isHouseAvailable(houseId);

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
              <span className={`status-badge ${isAvailable ? "available" : "unavailable"}`}>
                {isAvailable ? "Available" : "Unavailable"}
              </span>
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
                    {approvedReservations.map((reservation) => (
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
                      <div className="unavailable-notice">
                        ⚠️ This house is currently marked as unavailable, but you can check future dates.
                      </div>
                    )}
                    <Order
                      ownerId={ownerId!}
                      houseId={houseId}
                      buyerId={currentUserMongoDb._id!.toString()}
                      reservedDates={approvedReservations.map((reservation) => ({
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
    try {
      const { houseId } = await params;
      const house = await gethouseById(houseId);
      const images: string[] = house.images || [];

      return (
        <div className="house-container">
          <h1 className="house-title">{house.title}</h1>
          <HouseSlideshow images={images} />
          <div className="house-info">
            <p>
              <strong>Location:</strong> {house.location || "N/A"}
            </p>
            <p>
              <strong>Price per day:</strong> DT {house.pricePerDay ?? "N/A"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {house.description || "No description available."}
            </p>
            <p style={{ fontSize: "20px", fontWeight: "bolder" }}>
              You're not logged in
            </p>
          </div>
        </div>
      );
    } catch (error: any) {
      return (
        <div style={{ textAlign: "center", color: "red" }}>
          An error occurred while loading the house details.
        </div>
      );
    }
  }
}
