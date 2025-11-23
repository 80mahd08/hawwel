import HouseLink from "@/components/HouseLink/HouseLink";
import { getAllhouses } from "@/lib/dbFunctions";

export default async function page() {
  const housesData = await getAllhouses();
  const houses = housesData?.map(house => JSON.parse(JSON.stringify(house))) || [];

  if (houses.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>No houses available.</p>
      </div>
    );
  }

  return (
    <div className="houses-list">
      {houses.map((house) => (
        <HouseLink key={house._id} house={house} />
      ))}
    </div>
  );
}
