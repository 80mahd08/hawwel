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
      <div className="house-container">
        <h1 className="house-title">{house.title}</h1>

        {/* Add availability status */}
        <div
          style={{
            color: isAvailable ? "green" : "red",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {isAvailable ? "✅ Available" : "❌ Currently Unavailable"}
        </div>

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

          {approvedReservations.length > 0 && (
            <div>
              <strong>Reserved dates:</strong>
              <ul>
                {approvedReservations.map((reservation) => (
                  <li key={reservation._id}>
                    {new Date(reservation.startDate).toLocaleDateString()} -{" "}
                    {new Date(reservation.endDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FIX: Only show message if user IS the owner */}
          {isOwner && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              This is your house.
            </p>
          )}

          {/* FIX: Only show Order if user exists AND is NOT the owner AND house is available */}
          {currentUserMongoDb && !isOwner && isAvailable && (
            <Order
              ownerId={ownerId!}
              houseId={houseId}
              buyerId={currentUserMongoDb._id!.toString()}
              reservedDates={approvedReservations.map((reservation) => ({
                startDate: reservation.startDate,
                endDate: reservation.endDate,
              }))}
            />
          )}

          {/* Show message if house is unavailable */}
          {!isAvailable && currentUserMongoDb && !isOwner && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              This house is currently unavailable for reservations.
            </p>
          )}
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
