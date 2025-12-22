"use client";

import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { useFavCount } from "@/context/FavCountProvider";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('HouseCard');

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleAddFavorite = async () => {
    if (!user?.id) {
      Swal.fire({
        icon: "info",
        title: t('loginRequired'),
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
        title: t('addedSuccess'),
        showConfirmButton: false,
        timer: 1500,
      });

      refreshCountFav(user.id);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: t('errorAdding'),
      });
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <button className="btn" onClick={handleAddFavorite}>
      {t('addToFavorites')}
    </button>
  );
}
