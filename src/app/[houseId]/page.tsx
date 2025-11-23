import { gethouseById, getUserByClerkId } from "@/lib/dbFunctions";
import HouseSlideshow from "@/components/HouseSlideshow";
import OrderNumberBtn from "@/components/OrderNumberBtn";
import { currentUser } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ houseId: string }>;
}

export default async function Page({ params }: PageProps) {
  try {
    const { houseId } = await params;

    // Fetch maison data
    const house = await gethouseById(houseId);
    if (!house) {
      return (
        <div style={{ textAlign: "center", color: "red" }}>
          house not found.
        </div>
      );
    }

    // Fetch current user from Clerk
    const user = await currentUser();
    const currentUserMongoDb = user ? await getUserByClerkId(user.id) : null;

    const ownerId = house.ownerId?.toString();
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

          {/* Only show message if user is owner */}
          {ownerId && currentUserMongoDb?._id?.toString() === ownerId && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              This is your house.
            </p>
          )}

          {/* Only show OrderNumberBtn if a user is logged in AND is not the owner */}
          {currentUserMongoDb &&
            currentUserMongoDb._id?.toString() !== ownerId && (
              <OrderNumberBtn
                ownerId={ownerId}
                houseId={house._id?.toString() || ""}
              />
            )}
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Error fetching house or user:", error);
    return (
      <div style={{ textAlign: "center", color: "red" }}>
        Something went wrong while loading this maison. Please try again later.
      </div>
    );
  }
}
