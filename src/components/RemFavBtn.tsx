"use client";

import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation"; // Add this import
import { useFavCount } from "@/context/FavCountProvider";
import { Button } from "@chakra-ui/react";

type RemFavBtnProps = {
  maisonId: string;
};

export default function RemFavBtn({ maisonId }: RemFavBtnProps) {
  const { user } = useUser();
  const router = useRouter(); // Initialize router
  const { refreshCount } = useFavCount();

  const handleRemoveFav = async () => {
    try {
      const response = await fetch("/api/rem-fav", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id, maisonId }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }
      Swal.fire({
        icon: "success",
        title: "Removed from favorites!",
        showConfirmButton: false,
        timer: 1500,
      });
      router.refresh(); // Refresh the page
      if (user?.id) {
        refreshCount(user.id);
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove from favorites.",
      });
    }
  };
  return (
    <Button className="btn" onClick={handleRemoveFav}>
      remove from favorite
    </Button>
  );
}
