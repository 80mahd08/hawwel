"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { usePendingCount } from "@/context/PendingCountProvider";
import { useUser } from "@clerk/nextjs";

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
  const { refreshCountPending } = usePendingCount();
  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: "Accept pending request?",
      text: "Are you sure you want to accept this pending request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, accept",
      cancelButtonText: "Cancel",
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
        throw new Error(body?.error || body?.message || "Request failed");

      await Swal.fire({
        title: "Accepted",
        text: "Pending accepted.",
        icon: "success",
      });
      refreshCountPending(user?.id);

      router.refresh();
    } catch (err: any) {
      await Swal.fire({
        title: "Error",
        text: err?.message || "Error accepting pending.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" onClick={handleClick} disabled={loading}>
      {loading ? "Accepting..." : "accept"}
    </button>
  );
}
