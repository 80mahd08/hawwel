import { getMaisonById } from "@/lib/dbFunctions";
import MaisonSlideshow from "@/components/MaisonSlideshow";

export default async function Page({
  params,
}: {
  params: Promise<{ maisonId: string }>;
}) {
  const { maisonId } = await params;
  const maison = await getMaisonById(maisonId);
  if (!maison) {
    return <div style={{ textAlign: "center" }}>Maison not found.</div>;
  }

  const images: string[] = maison.images || [];

  return (
    <div>
      <h1 className="maison-title">{maison.title}</h1>
      <MaisonSlideshow images={images} />
      <div className="maison-info">
        <p>
          <strong>Location:</strong> {maison.location}
        </p>
        <p>
          <strong>Price per day:</strong> DT {maison.pricePerDay}
        </p>
        <p>
          <strong>Telephone</strong> {maison.telephone}
        </p>
        <p>
          <strong>Description:</strong> {maison.description}
        </p>
      </div>
    </div>
  );
}
