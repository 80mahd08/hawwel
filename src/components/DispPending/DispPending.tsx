import { gethouseById, getUserByClerkId, getUserById } from "@/lib/dbFunctions";
import Image from "next/image";
import BtnAccept from "./components/BtnAccept";
import BtnRefuse from "./components/BtnRefuse";

export default async function DispPending({
  pending,
  mongoUser,
}: {
  pending: {
    _id: string;
    ownerId: string;
    buyerId: string;
    houseId: string;
    startDate: Date;
    endDate: Date;
    createdAt: string;
  };
  mongoUser: {
    _id: string;
    clerkId: string;
    name: string;
  };
}) {
  const house = await gethouseById(pending.houseId);

  if (!house || !mongoUser) {
    return null;
  }

  return (
    <div className="pending-item">
      <div className="image">
        {house.images && house.images.length > 0 ? (
          <Image
            src={house.images[0]}
            alt={house.title}
            width={200}
            height={150}
          />
        ) : (
          <Image
            src="/placeholder.png"
            alt="placeholder"
            width={200}
            height={150}
          />
        )}
      </div>
      <div className="content">
        <h3>buyer name: {mongoUser.name}</h3>
        <p>house title: {house.title}</p>
        <p>
          reserved dates:{" "}
          <strong>
            {new Date(pending.startDate).toLocaleDateString()} -{" "}
            {new Date(pending.endDate).toLocaleDateString()}
          </strong>
        </p>
      </div>
      <div className="btns">
        <BtnRefuse pendingId={pending._id} />
        <BtnAccept pendingId={pending._id} houseId={pending.houseId} />
      </div>
    </div>
  );
}
