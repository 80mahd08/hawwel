"use client";
import { useState } from "react";
import Swal from "sweetalert2";

function OrderNumberBtn({
  houseId,
  ownerId,
}: {
  houseId: string;
  ownerId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: "Send order request?",
      text: "Do you want to send an order request to the owner?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send",
      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId, ownerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        await Swal.fire({
          title: "Error",
          text: data?.message || "Failed to create order",
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: "Sent",
          text: "Order request sent.",
          icon: "success",
        });
      }
    } catch (err: any) {
      await Swal.fire({
        title: "Error",
        text: err?.message || "Network error",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} className="btn" disabled={loading}>
      {loading ? "Sending..." : "Order Number"}
    </button>
  );
}

export default OrderNumberBtn;
