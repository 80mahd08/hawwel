import LinkMaison from "@/components/LinkMaison";
import { getUserByClerkId, getUserFavoris } from "@/lib/dbFunctions";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";

export default async function page() {
  const { userId: clerkId } = await auth();
  const user = await getUserByClerkId(clerkId as string);
  const maisons = await getUserFavoris(new Types.ObjectId(user._id));
  return (
    <div className="maisons-list">
      {maisons.map((maison) => {
        const plainMaison = {
          ...maison.maisonId.toObject(),
          _id: maison.maisonId._id.toString(),
        };
        return <LinkMaison key={plainMaison._id} maison={plainMaison} />;
      })}
    </div>
  );
}
