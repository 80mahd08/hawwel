"use client";

import { useFavCount } from "@/context/FavCountProvider";
import { Button } from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import Swal from "sweetalert2";

type FavBtnProps = {
  maisonId: string;
};

export default function FavBtn({ maisonId }: FavBtnProps) {
  const { user } = useUser();
  const { refreshCount } = useFavCount();
  const handleAddFav = async () => {
    try {
      const response = await fetch("/api/add-fav", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id, maisonId }),
      });
      if (!response.ok) {
        throw new Error("Failed to add favorite");
      }

      Swal.fire({
        icon: "success",
        title: "Added to favorites!",
        showConfirmButton: false,
        timer: 1500,
      });
      if (user?.id) {
        refreshCount(user.id);
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add to favorites.",
      });
    }
  };
  return (
    <Button className="btn" onClick={handleAddFav}>
      add to favorite
    </Button>
  );
}
