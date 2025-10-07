import { getMaisonById, getUserByClerkId } from "@/lib/dbFunctions";
import MaisonSlideshow from "@/components/MaisonSlideshow";
import OrderNumberBtn from "@/components/OrderNumberBtn";
import { currentUser } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ maisonId: string }>;
}

export default async function Page({ params }: PageProps) {
  try {
    const { maisonId } = await params;

    // Fetch maison data
    const maison = await getMaisonById(maisonId);
    if (!maison) {
      return (
        <div style={{ textAlign: "center", color: "red" }}>
          Maison not found.
        </div>
      );
    }

    // Fetch current user from Clerk
    const user = await currentUser();
    const currentUserMongoDb = user ? await getUserByClerkId(user.id) : null;

    const ownerId = maison.ownerId?.toString();
    const images: string[] = maison.images || [];

    return (
      <div className="maison-container">
        <h1 className="maison-title">{maison.title}</h1>
        <MaisonSlideshow images={images} />
        <div className="maison-info">
          <p>
            <strong>Location:</strong> {maison.location || "N/A"}
          </p>
          <p>
            <strong>Price per day:</strong> DT {maison.pricePerDay ?? "N/A"}
          </p>
          <p>
            <strong>Description:</strong>{" "}
            {maison.description || "No description available."}
          </p>

          {/* Only show message if user is owner */}
          {ownerId && currentUserMongoDb?._id?.toString() === ownerId && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              This is your maison.
            </p>
          )}

          {/* Only show OrderNumberBtn if a user is logged in AND is not the owner */}
          {currentUserMongoDb &&
            currentUserMongoDb._id?.toString() !== ownerId && (
              <OrderNumberBtn telephone={maison.telephone || ""} />
            )}
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Error fetching maison or user:", error);
    return (
      <div style={{ textAlign: "center", color: "red" }}>
        Something went wrong while loading this maison. Please try again later.
      </div>
    );
  }
}
