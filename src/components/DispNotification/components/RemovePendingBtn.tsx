"use client";

import { useNotificationCount } from "@/context/NotificationCountProvider";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function RemovePendingBtn({ pendingId }: { pendingId: string }) {
  const { refreshCountNotification } = useNotificationCount();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: "Remove notification?",
      text: "Are you sure you want to remove this notification?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
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
          title: "Error",
          text: data?.error || "Failed to remove notification",
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: "Removed",
          text: "Notification removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        refreshCountNotification(user?.id);
        router.refresh();
      }
    } catch (error: any) {
      await Swal.fire({
        title: "Error",
        text: error?.message || "Failed to remove notification",
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
        {loading ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
