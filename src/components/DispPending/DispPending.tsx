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
        <div className="buyer-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {(pending.buyerId as any)?.imageUrl ? (
            <img 
              src={(pending.buyerId as any).imageUrl} 
              alt="Buyer" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#e2e8f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#64748b'
            }}>
              {(pending.buyerId as any)?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <h3>{(pending.buyerId as any)?.name || "Unknown Buyer"}</h3>
        </div>
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
