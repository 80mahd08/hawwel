"use client";
import React from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function RemHouseBtn({ houseId }: { houseId: string }) {
  const router = useRouter();

  const handleRemoveHouse = async () => {
    const confirmed = await Swal.fire({
      title: "Delete house?",
      text: "This will permanently delete the house. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch("/api/house/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId }),
      });

      if (!res.ok) throw new Error("Failed to remove house");

      await Swal.fire({
        title: "Deleted",
        text: "The house was deleted successfully.",
        icon: "success",
      });

      router.refresh();
    } catch (err) {
      await Swal.fire({
        title: "Error",
        text: "Could not delete house. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <button onClick={handleRemoveHouse} className="btn">
      Remove house
    </button>
  );
}
