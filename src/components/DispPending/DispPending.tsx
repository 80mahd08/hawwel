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
    houseId: any;
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
  const house = pending.houseId;

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
        <h3><span className="label">Buyer:</span> {mongoUser.name}</h3>
        <p className="title"><span className="label">Property:</span> {house.title}</p>
        <p>
          <span className="label">Reserved Dates:</span>
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
