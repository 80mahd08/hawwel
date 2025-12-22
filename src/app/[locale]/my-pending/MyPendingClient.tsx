"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import DispPending from "@/components/DispPending/DispPending";
import Pagination from "@/components/Pagination/Pagination";
import { useTranslations } from "next-intl";

interface IPendingRequest {
  _id: string;
  ownerId: string;
  buyerId: string | { _id: string; name?: string; imageUrl?: string };
  houseId: { _id: string; title: string; images: string[] };
  startDate: Date;
  endDate: Date;
  createdAt: string;
}

export default function MyPendingClient({
  pendings,
  totalPages,
  currentPage,
  mongoUser
}: {
  pendings: IPendingRequest[];
  totalPages: number;
  currentPage: number;
  mongoUser: { _id: string; clerkId: string; name: string } | null;
}) {
  const router = useRouter();
  const t = useTranslations('Pending');

  useEffect(() => {
    const handleRefresh = () => {
      router.refresh();
    };

    window.addEventListener("refresh-booking-data", handleRefresh);
    return () => window.removeEventListener("refresh-booking-data", handleRefresh);
  }, [router]);

  if (pendings && pendings.length > 0) {
    return (
      <div className="container my-pending">
        {pendings.map((pending) => (
          <DispPending
            key={pending._id}
            pending={pending}
            mongoUser={mongoUser}
          />
        ))}
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    );
  }
  return <div style={{ textAlign: "center", padding: "4rem" }}>{t('noPending')}</div>;
}
