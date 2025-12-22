import { Link } from "@/i18n/routing";
import Image from "next/image";
import RemovePendingBtn from "./components/RemovePendingBtn";
import StartChatBtn from "../Chat/StartChatBtn";
import { useTranslations } from "next-intl";

export default function DispNotification({
  pending,
}: {
  pending: {
    _id: string;
    ownerId: string;
    buyerId: string;
    houseId: {
      _id: string;
      title: string;
      images: string[];
      telephone?: string;
    };
    status: string;
    createdAt: string;
    startDate: string;
    endDate: string;
  };
}) {
  const house = pending.houseId;
  const t = useTranslations('Notifications');
  const tPending = useTranslations('Pending');

  if (!house) {
    return null;
  }
  return (
    <div className="notification-item">
      {" "}
      <div className="image">
        <Link href={`/${house._id}`}>
          {house.images && house.images.length > 0 ? (
            <Image
              src={house.images[0]}
              alt={house.title}
              width={200}
              height={150}
              unoptimized={true}
            />
          ) : (
            <Image
              src="/placeholder.png"
              alt="placeholder"
              width={200}
              height={150}
              unoptimized={true}
            />
          )}
        </Link>
      </div>
      <div className="content">
        <div className="text-wrapper">
          <Link href={`/${house._id}`} className="title-link">
            <p className="title">{house.title}</p>
          </Link>
          <p className="status-text" style={{ 
            color: pending.status === "approved" ? "#22c55e" : "#ef4444",
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '0.05em',
            margin: '4px 0'
          }}>
            {t('statusLabel')} {tPending(pending.status.toLowerCase())}
          </p>
          <p>
            <span className="label">{t('datesLabel')}</span>
            <strong>
              {new Date(pending.startDate).toLocaleDateString()} -{" "}
              {new Date(pending.endDate).toLocaleDateString()}
            </strong>
          </p>{" "}
          {pending.status === "approved" && (
            <>
              <p>
                <span className="label">{t('contactOwnerLabel')}</span> <strong>{house.telephone}</strong>
              </p>
              <StartChatBtn participantId={pending.ownerId} label={t('chatWithOwner')} />
            </>
          )}
        </div>
        <RemovePendingBtn pendingId={pending._id} />
      </div>
    </div>
  );
}
