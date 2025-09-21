import LinkMaison from "@/components/LinkMaison";
import { getUserByClerkId, getMaisonsByOwner } from "@/lib/dbFunctions";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";

export default async function page() {
  const { userId: clerkId } = await auth();
  const user = await getUserByClerkId(clerkId as string);
  if (!user) {
    return <div>User not found.</div>;
  }
  const maisons = await getMaisonsByOwner(new Types.ObjectId(user._id));
  return (
    <div className="maisons-list">
      {maisons.map((maison) => {
        const plainMaison = {
          ...maison.toObject(),
          _id: maison._id.toString(),
        };
        return <LinkMaison key={plainMaison._id} maison={plainMaison} />;
      })}
    </div>
  );
}
