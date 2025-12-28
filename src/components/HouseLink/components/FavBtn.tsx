"use client";

import { useUser } from "@clerk/nextjs";
import { useFavCount } from "@/context/FavCountProvider";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

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
      toast(t('loginRequired'), { icon: '🔑' });
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
      
      toast.success(t('addedSuccess'));

      refreshCountFav(user.id);
    } catch (error) {
      toast.error(t('errorAdding') || "Error adding to favorites");
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
