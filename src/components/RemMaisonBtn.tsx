"use client";

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Button } from "@chakra-ui/react";

type RemMaisonBtnProps = {
  maisonId: string;
};

export default function RemMaisonBtn({ maisonId }: RemMaisonBtnProps) {
  const router = useRouter();

  const handleRemoveMaison = async () => {
    try {
      const response = await fetch("/api/remove-maison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ maisonId }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove maison");
      }
      Swal.fire({
        icon: "success",
        title: "Maison removed!",
        showConfirmButton: false,
        timer: 1500,
      });
      router.refresh();
    } catch (error) {
      console.error("Error removing maison:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove maison.",
      });
    }
  };

  return (
    <Button className="btn" onClick={handleRemoveMaison}>
      remove maison
    </Button>
  );
}
