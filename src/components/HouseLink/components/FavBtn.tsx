"use client";

import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { useFavCount } from "@/context/FavCountProvider";

// ============================================
// Types
// ============================================
type FavBtnProps = {
  houseId: string;
};

// ============================================
// Component
// ============================================
export default function FavBtn({ houseId }: FavBtnProps) {
  const { user } = useUser();
  const { refreshCountFav } = useFavCount();

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleAddFavorite = async () => {
    if (!user?.id) {
      Swal.fire({
        icon: "info",
        title: "Please log in first.",
      });
      return;
    }

    try {
      const response = await fetch("/api/favorite/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, houseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to favorites");
      }

      Swal.fire({
        icon: "success",
        title: "Added to favorites!",
        showConfirmButton: false,
        timer: 1500,
      });

      refreshCountFav(user.id);
    } catch (error) {
      console.error("Error adding favorite:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add to favorites.",
      });
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <button className="btn" onClick={handleAddFavorite}>
      Add to favorites
    </button>
  );
}
