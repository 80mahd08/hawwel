import Image from "next/image";
import RemovePendingBtn from "./components/RemovePendingBtn";

export default async function DispNotification({
  pending,
}: {
  pending: {
    _id: string;
    ownerId: string;
    buyerId: string;
    houseId: any;
    status: string;
    createdAt: string;
    startDate: string;
    endDate: string;
  };
}) {
  const house = pending.houseId;

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
        <div className="text-wrapper">
          <p className="title">{house.title}</p>
          <p className="status-text" style={{ 
            color: pending.status === "approved" ? "#22c55e" : "#ef4444",
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '0.05em',
            margin: '4px 0'
          }}>
            Status: {pending.status}
          </p>
          <p>
            <span className="label">Dates:</span>
            <strong>
              {new Date(pending.startDate).toLocaleDateString()} -{" "}
              {new Date(pending.endDate).toLocaleDateString()}
            </strong>
          </p>{" "}
          {pending.status === "approved" && (
            <p>
              <span className="label">Contact Owner:</span> <strong>{house.telephone}</strong>
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
