"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { useChat } from "@/context/ChatContext";
import { useTranslations } from "next-intl";

function Order({
  houseId,
  ownerId,
  buyerId,
  reservedDates,
}: {
  houseId: string;
  ownerId: string;
  buyerId: string;
  reservedDates: { startDate: string; endDate: string }[];
}) {
  const { socket } = useChat();
  const t = useTranslations('Order');

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: t('sendRequestTitle'),
      text: t('sendRequestMessage'),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t('yesSend'),
      cancelButtonText: t('cancel'),
    });
    if (!validateDates()) {
      await Swal.fire({
        title: t('invalidDatesTitle'),
        text: error || "Please check the selected dates.",
        icon: "error",
      });
      return;
    }
    if (!confirmed.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pending/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId, ownerId, buyerId, startDate, endDate }),
      });

      const data = await res.json();
      if (!res.ok) {
        await Swal.fire({
          title: t('errorTitle'),
          text: data?.message || "Failed to create order",
          icon: "error",
        });
      } else {
        // --- REAL-TIME NOTIFICATION ---
        if (socket?.connected) {
          socket.emit("booking-request", {
            ownerId,
            pending: data.pending,
          });
        }
        
        await Swal.fire({
          title: t('successTitle'),
          text: t('successMessage'),
          icon: "success",
        });
      }
    } catch (err: unknown) {
      await Swal.fire({
        title: t('errorTitle'),
        text: (err as Error)?.message || "Network error",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateDates = () => {
    if (reservedDates.length > 0) {
      for (const dateRange of reservedDates) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        const inputStart = new Date(startDate);
        const inputEnd = new Date(endDate);

        if (
          (inputStart >= start && inputStart <= end) ||
          (inputEnd >= start && inputEnd <= end) ||
          (inputStart <= start && inputEnd >= end)
        ) {
          setError(t('overlapError'));
          return false;
        }
      }
    }
    if (!startDate || !endDate) {
      setError(t('requiredDatesError'));
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError(t('dateOrderError'));
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <div className="order-card-content">
      <div className="date-picker-wrapper">
        <div className="date-input-group">
          <label htmlFor="startDate">{t('checkIn')}</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="endDate">{t('checkOut')}</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            min={startDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleClick} className="reserve-btn" disabled={loading}>
        {loading ? (
          <span className="loading-spinner"></span>
        ) : (
          t('reserve')
        )}
      </button>
      
      <p className="no-charge-text">{t('noChargeYet')}</p>
    </div>
  );
}

export default Order;
