"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { addMonths, isSameDay, isWithinInterval, parseISO } from "date-fns";
import "react-day-picker/dist/style.css";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface AvailabilityCalendarProps {
  reservedDates: DateRange[];
}

export default function AvailabilityCalendar({ reservedDates }: AvailabilityCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());

  // Convert string dates to Date objects
  const disabledDays = reservedDates.map((range) => ({
    from: new Date(range.startDate),
    to: new Date(range.endDate),
  }));

  const bookedStyle = { color: "#ef4444", fontWeight: "bold" };

  return (
    <div className="availability-calendar-container">
      <h3>Availability</h3>
      <p className="subtitle">Prices may vary depending on the dates selected.</p>
      
      <div className="calendar-wrapper">
        <DayPicker
          fromDate={new Date()}
          numberOfMonths={1}
          month={month}
          onMonthChange={setMonth}
          disabled={disabledDays}
          modifiers={{
            booked: disabledDays,
          }}
          modifiersStyles={{
            booked: {
              textDecoration: "line-through",
              color: "#ccc",
            },
          }}
          styles={{
            head_cell: {
              width: "40px",
            },
            table: {
              maxWidth: "none",
            },
            day: {
              margin: "auto",
            },
          }}
        />
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <span className="dot available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="dot new-booked" style={{ background: '#ccc', textDecoration: 'line-through' }}></span>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
