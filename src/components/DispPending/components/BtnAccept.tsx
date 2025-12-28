"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import Swal from "sweetalert2";
import { usePendingCount } from "@/context/PendingCountProvider";
import { useUser } from "@clerk/nextjs";
import { useChat } from "@/context/ChatContext";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

export default function BtnAccept({
  pendingId,
  houseId,
}: {
  pendingId: string;
  houseId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { socket } = useChat();
  const { refreshCountPending } = usePendingCount();
  const t = useTranslations('Pending');

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: t('acceptDialog.title'),
      text: t('acceptDialog.text'),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t('acceptDialog.confirm'),
      cancelButtonText: t('acceptDialog.cancel'),
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, houseId }),
      });

      const body = await res.json();
      if (!res.ok)
        throw new Error(body?.error || body?.message || t('acceptDialog.errorText'));

      // --- REAL-TIME NOTIFICATION ---
      if (socket?.connected && body.pending) {
        socket.emit("booking-status-update", {
          buyerId: body.pending.buyerId,
          pending: body.pending,
        });
      }

      toast.success(t('acceptDialog.successTitle'));
      refreshCountPending(user?.id);

      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || t('acceptDialog.errorText'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" onClick={handleClick} disabled={loading}>
      {loading ? t('acceptDialog.buttonAccepting') : t('approve')}
    </button>
  );
}
