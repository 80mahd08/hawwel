"use client";

import { useNotificationCount } from "@/context/NotificationCountProvider";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import Swal from "sweetalert2";
import { useChat } from "@/context/ChatContext";
import { useTranslations } from "next-intl";

export default function RemovePendingBtn({ pendingId }: { pendingId: string }) {
  const { refreshCountNotification } = useNotificationCount();
  const { user } = useUser();
  const { socket } = useChat();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Notifications');

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: t('removeDialog.title'),
      text: t('removeDialog.text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('removeDialog.confirm'),
      cancelButtonText: t('removeDialog.cancel'),
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        await Swal.fire({
          title: t('removeDialog.errorTitle'),
          text: data?.error || t('removeDialog.errorText'),
          icon: "error",
        });
      } else {
        // --- REAL-TIME NOTIFICATION ---
        if (socket && user?.id) {
          socket.emit("booking-cleared", {
            userId: user.id, // This should ideally be mongoId, but let's check
            pendingId,
          });
        }

        await Swal.fire({
          title: t('removeDialog.successTitle'),
          text: t('removeDialog.successText'),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        refreshCountNotification(user?.id);
        router.refresh();
      }
    } catch (error: unknown) {
      await Swal.fire({
        title: t('removeDialog.errorTitle'),
        text: (error as Error)?.message || t('removeDialog.errorText'),
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="btns">
      <button className="btn remove-btn" onClick={handleClick} disabled={loading} style={{ 
        background: 'transparent', 
        color: '#ef4444', 
        border: '1px solid #ef4444',
        padding: '6px 12px',
        fontSize: '0.8rem'
      }}>
        {loading ? t('removeDialog.buttonRemoving') : t('remove')}
      </button>
    </div>
  );
}
