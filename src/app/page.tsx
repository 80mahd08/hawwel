import LinkMaison from "@/components/LinkMaison";
import { getAllMaisons } from "@/lib/dbFunctions";

export default async function page() {
  const maisons = await getAllMaisons();

  if (!maisons || maisons.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>No maisons available.</p>
      </div>
    );
  }

  return (
    <div className="maisons-list">
      {maisons.map((maison) => (
        <LinkMaison key={maison._id} maison={maison} />
      ))}
    </div>
  );
}
