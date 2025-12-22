"use client";

import React from "react";
import Swal from "sweetalert2";
import { useRouter } from "@/i18n/routing";
import { useUser } from "@clerk/nextjs";
import { useFavCount } from "@/context/FavCountProvider";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('HouseCard');

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleRemoveFavorite = async () => {
    if (!user?.id) {
      Swal.fire({
        icon: "info",
        title: t('loginRequired'),
      });
      return;
    }
    // Confirm with user before removing
    const confirmation = await Swal.fire({
      title: t('removeFavDialog.title'),
      text: t('removeFavDialog.text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('removeFavDialog.confirm'),
      cancelButtonText: t('removeFavDialog.cancel'),
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
        title: t('removeFavDialog.successTitle'),
        showConfirmButton: false,
        timer: 1500,
      });

      // Refresh count + page
      refreshCountFav(user.id);
      router.refresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: t('removeFavDialog.errorText'),
      });
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <button onClick={handleRemoveFavorite} className="btn">
      {t('removeFromFavorites')}
    </button>
  );
}
