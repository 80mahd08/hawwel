import { gethouseById } from "@/lib/dbFunctions";
import Image from "next/image";
import RemovePendingBtn from "./components/RemovePendingBtn";

export default async function DispNotification({
  pending,
}: {
  pending: {
    _id: string;
    ownerId: string;
    buyerId: string;
    houseId: string;
    status: string;
    createdAt: string;
    startDate: string;
    endDate: string;
  };
}) {
  const house = await gethouseById(pending.houseId);

  if (!house) {
    return null;
  }
  return (
    <div className="notification-item">
      {" "}
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
        <div className="texts">
          <p>house title: {house.title}</p>
          <p style={{ color: pending.status === "approved" ? "green" : "red" }}>
            status: {pending.status}
          </p>
          <p>
            reserved dates:{" "}
            <strong>
              {new Date(pending.startDate).toLocaleDateString()} -{" "}
              {new Date(pending.endDate).toLocaleDateString()}
            </strong>
          </p>{" "}
          {pending.status === "approved" && (
            <p>
              You can contact the owner at: <strong>{house.telephone}</strong>
            </p>
          )}
        </div>
        {pending.status === "rejected" && (
          <RemovePendingBtn pendingId={pending._id} />
        )}
      </div>
    </div>
  );
}
