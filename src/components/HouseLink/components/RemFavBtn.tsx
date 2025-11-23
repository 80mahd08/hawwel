"use client";

import React from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useFavCount } from "@/context/FavCountProvider";

// ============================================
// Types
// ============================================
type RemFavBtnProps = {
  houseId: string;
};

// ============================================
// Component
// ============================================
export default function RemFavBtn({ houseId }: RemFavBtnProps) {
  const router = useRouter();
  const { user } = useUser();
  const { refreshCountFav } = useFavCount();

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleRemoveFavorite = async () => {
    if (!user?.id) {
      Swal.fire({
        icon: "info",
        title: "Please log in first.",
      });
      return;
    }
    // Confirm with user before removing
    const confirmation = await Swal.fire({
      title: "Remove from favorites?",
      text: "Are you sure you want to remove this house from your favorites?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const response = await fetch("/api/favorite/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, houseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }

      Swal.fire({
        icon: "success",
        title: "Removed from favorites!",
        showConfirmButton: false,
        timer: 1500,
      });

      // Refresh count + page
      refreshCountFav(user.id);
      router.refresh();
    } catch (error) {
      console.error("Error removing favorite:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove from favorites.",
      });
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <button onClick={handleRemoveFavorite} className="btn">
      Remove from favorites
    </button>
  );
}
