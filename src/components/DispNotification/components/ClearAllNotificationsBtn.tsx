"use client";

import { useNotificationCount } from "@/context/NotificationCountProvider";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function ClearAllNotificationsBtn() {
  const { refreshCountNotification } = useNotificationCount();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    const confirmed = await Swal.fire({
      title: "Clear all notifications?",
      text: "This will remove all your notifications permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/clear-all", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        await Swal.fire({
          title: "Error",
          text: data?.error || "Failed to clear notifications",
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: "Cleared!",
          text: "All notifications have been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        refreshCountNotification(user?.id);
        router.refresh();
      }
    } catch (error: any) {
      await Swal.fire({
        title: "Error",
        text: error?.message || "Failed to clear notifications",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
      <button 
        className="btn" 
        onClick={handleClearAll} 
        disabled={loading}
        style={{ 
          background: "transparent", 
          color: "#ef4444", 
          border: "1px solid #ef4444",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "0.9rem",
          fontWeight: "600",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.background = "#fee2e2";
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
        }}
      >
        {loading ? "Clearing..." : "Clear All Notifications"}
      </button>
    </div>
  );
}
