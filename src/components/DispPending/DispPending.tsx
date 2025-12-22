import NextImage from "next/image";
import BtnAccept from "./components/BtnAccept";
import BtnRefuse from "./components/BtnRefuse";
import StartChatBtn from "../Chat/StartChatBtn";
import { useTranslations } from "next-intl";

interface IBuyer {
  _id: string;
  name?: string;
  imageUrl?: string;
}

export default function DispPending({
  pending,
  mongoUser,
}: {
  pending: {
    _id: string;
    ownerId: string;
    buyerId: string | IBuyer;
    houseId: { _id: string; title: string; images: string[] };
    startDate: Date;
    endDate: Date;
    createdAt: string;
  };
  mongoUser: {
    _id: string;
    clerkId: string;
    name: string;
  } | null;
}) {
  const house = pending.houseId;
  const t = useTranslations('Pending');

  if (!house || !mongoUser) {
    return null;
  }

  return (
    <div className="pending-item">
      <div className="image">
        {house.images && house.images.length > 0 ? (
          <NextImage
            src={house.images[0]}
            alt={house.title}
            width={200}
            height={150}
            unoptimized={true}
          />
        ) : (
          <NextImage
            src="/placeholder.png"
            alt="placeholder"
            width={200}
            height={150}
            unoptimized={true}
          />
        )}
      </div>
      <div className="content">
        <div className="buyer-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {(pending.buyerId as IBuyer)?.imageUrl ? (
            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
              <NextImage 
                src={(pending.buyerId as IBuyer).imageUrl!} 
                alt="Buyer" 
                fill
                sizes="40px"
                style={{ borderRadius: '50%', objectFit: 'cover' }}
                unoptimized={true}
              />
            </div>
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
              {(pending.buyerId as IBuyer)?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <h3>{(pending.buyerId as IBuyer)?.name || t('unknownBuyer')}</h3>
        </div>
        <p className="title"><span className="label">{t('propertyLabel')}</span> {house.title}</p>
        <p>
          <span className="label">{t('reservedDatesLabel')}</span>
          <strong>
            {new Date(pending.startDate).toLocaleDateString()} -{" "}
            {new Date(pending.endDate).toLocaleDateString()}
          </strong>
        </p>
        <StartChatBtn participantId={(pending.buyerId as IBuyer)?._id || (pending.buyerId as string)} label={t('chatWithBuyer')} />
      </div>
      <div className="btns">
        <BtnRefuse pendingId={pending._id} />
        <BtnAccept pendingId={pending._id} houseId={pending.houseId._id} />
      </div>
    </div>
  );
}
