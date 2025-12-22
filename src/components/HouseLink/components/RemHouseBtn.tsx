"use client";
import React from "react";
import Swal from "sweetalert2";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function RemHouseBtn({ houseId }: { houseId: string }) {
  const router = useRouter();
  const t = useTranslations('HouseCard');

  const handleRemoveHouse = async () => {
    const confirmed = await Swal.fire({
      title: t('removeHouseDialog.title'),
      text: t('removeHouseDialog.text'),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t('removeHouseDialog.confirm'),
      cancelButtonText: t('removeHouseDialog.cancel'),
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
        title: t('removeHouseDialog.successTitle'),
        text: t('removeHouseDialog.successText'),
        icon: "success",
      });

      router.refresh();
    } catch {
      await Swal.fire({
        title: "Error",
        text: t('removeHouseDialog.errorText'),
        icon: "error",
      });
    }
  };

  return (
    <button onClick={handleRemoveHouse} className="btn">
      {t('removeHouse')}
    </button>
  );
}
