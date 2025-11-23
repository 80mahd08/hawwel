"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useUser } from "@clerk/nextjs";
import { usePendingCount } from "@/context/PendingCountProvider";

export default function BtnRefuse({ pendingId }: { pendingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { refreshCountPending } = usePendingCount();

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: "Reject pending request?",
      text: "Are you sure you want to reject this pending request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
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
        throw new Error(body?.error || body?.message || "Request failed");

      await Swal.fire({
        title: "Rejected",
        text: "Pending rejected.",
        icon: "success",
      });
      refreshCountPending(user?.id);
      router.refresh();
    } catch (err: any) {
      await Swal.fire({
        title: "Error",
        text: err?.message || "Error rejecting pending.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" onClick={handleClick} disabled={loading}>
      {loading ? "Rejecting..." : "reject"}
    </button>
  );
}
