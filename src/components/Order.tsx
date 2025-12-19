"use client";
import { useState } from "react";
import Swal from "sweetalert2";

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
  console.log(reservedDates);

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    const confirmed = await Swal.fire({
      title: "Send order request?",
      text: "Do you want to send an order request to the owner?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send",
      cancelButtonText: "Cancel",
    });
    if (!validateDates()) {
      await Swal.fire({
        title: "Invalid Dates",
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
          title: "Error",
          text: data?.message || "Failed to create order",
          icon: "error",
        });
      } else {
        await Swal.fire({
          title: "Sent",
          text: "Order request sent.",
          icon: "success",
        });
      }
    } catch (err: any) {
      await Swal.fire({
        title: "Error",
        text: err?.message || "Network error",
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
          setError("Selected dates overlap with existing reservations.");
          return false;
        }
      }
    }
    if (!startDate || !endDate) {
      setError("Both start and end dates are required.");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date.");
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <div className="order-card-content">
      <div className="date-picker-wrapper">
        <div className="date-input-group">
          <label htmlFor="startDate">CHECK-IN</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="endDate">CHECKOUT</label>
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
          "Reserve"
        )}
      </button>
      
      <p className="no-charge-text">You won't be charged yet</p>
    </div>
  );
}

export default Order;
