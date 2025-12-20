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
      title: "Remove pending request?",
      text: "Are you sure you want to remove this pending request?",
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
          text: data?.message || "Failed to remove pending",
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: "Removed",
          text: "Pending request removed.",
          icon: "success",
        });
        refreshCountNotification(user?.id);
        router.refresh();
      }
    } catch (error: any) {
      await Swal.fire({
        title: "Error",
        text: error?.message || "Failed to remove pending",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="btns">
      <button className="btn" onClick={handleClick} disabled={loading}>
        {loading ? "Removing..." : "remove pending"}
      </button>
    </div>
  );
}
