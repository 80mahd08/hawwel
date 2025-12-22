"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import DispNotification from "@/components/DispNotification/DispNotification";
import ClearAllNotificationsBtn from "@/components/DispNotification/components/ClearAllNotificationsBtn";
import Pagination from "@/components/Pagination/Pagination";
import { useTranslations } from "next-intl";

interface IPendingNotification {
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
}

export default function MyNotificationClient({
  pendings,
  totalPages,
  currentPage,
}: {
  pendings: IPendingNotification[];
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const t = useTranslations('Notifications');

  useEffect(() => {
    const handleRefresh = () => {
      router.refresh();
    };

    window.addEventListener("refresh-booking-data", handleRefresh);
    return () => window.removeEventListener("refresh-booking-data", handleRefresh);
  }, [router]);

  if (pendings && pendings.length > 0) {
    return (
      <div className="container my-notification">
        <ClearAllNotificationsBtn />
        {pendings.map((pending) => (
          <DispNotification key={pending._id} pending={pending} />
        ))}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    );
  }
  return <div style={{ textAlign: "center", padding: "4rem" }}>{t('noNotifications')}</div>;
}
