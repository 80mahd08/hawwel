"use client";

import { useNotificationCount } from "@/context/NotificationCountProvider";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

export default function ClearAllNotificationsBtn() {
  const { refreshCountNotification } = useNotificationCount();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useTranslations('Notifications');

  const handleClearAll = async () => {
    const confirmed = await Swal.fire({
      title: t('clearDialog.title'),
      text: t('clearDialog.text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('clearDialog.confirm'),
      cancelButtonText: t('clearDialog.cancel'),
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/clear-all", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        await Swal.fire({
          title: t('clearDialog.errorTitle'),
          text: data?.error || t('clearDialog.errorText'),
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: t('clearDialog.successTitle'),
          text: t('clearDialog.successText'),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        refreshCountNotification(user?.id);
        router.refresh();
      }
    } catch (error: unknown) {
      await Swal.fire({
        title: t('clearDialog.errorTitle'),
        text: (error as Error)?.message || t('clearDialog.errorText'),
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
      <button 
        className="btn" 
        onClick={handleClearAll} 
        disabled={loading}
        style={{ 
          background: "transparent", 
          color: "#ef4444", 
          border: "1px solid #ef4444",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "0.9rem",
          fontWeight: "600",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.background = "#fee2e2";
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
        }}
      >
        {loading ? t('clearDialog.buttonClearing') : t('clearDialog.button')}
      </button>
    </div>
  );
}
