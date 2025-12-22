"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import Swal from "sweetalert2";
import { useUser } from "@clerk/nextjs";
import { usePendingCount } from "@/context/PendingCountProvider";
import { useChat } from "@/context/ChatContext";
import { useTranslations } from "next-intl";

export default function BtnRefuse({ pendingId }: { pendingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { socket } = useChat();
  const { refreshCountPending } = usePendingCount();
  const t = useTranslations('Pending');

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: t('rejectDialog.title'),
      text: t('rejectDialog.text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('rejectDialog.confirm'),
      cancelButtonText: t('rejectDialog.cancel'),
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId }),
      });

      const body = await res.json();
      if (!res.ok)
        throw new Error(body?.error || body?.message || t('rejectDialog.errorText'));

      // --- REAL-TIME NOTIFICATION ---
      if (socket?.connected && body.pending) {
        socket.emit("booking-status-update", {
          buyerId: body.pending.buyerId,
          pending: body.pending,
        });
      }

      await Swal.fire({
        title: t('rejectDialog.successTitle'),
        text: t('rejectDialog.successText'),
        icon: "success",
      });
      refreshCountPending(user?.id);
      router.refresh();
    } catch (err: unknown) {
      await Swal.fire({
        title: t('rejectDialog.errorTitle'),
        text: (err as Error)?.message || t('rejectDialog.errorText'),
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" onClick={handleClick} disabled={loading}>
      {loading ? t('rejectDialog.buttonRejecting') : t('reject')}
    </button>
  );
}
