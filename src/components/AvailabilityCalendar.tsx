
"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Locale } from "date-fns";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface AvailabilityCalendarProps {
  reservedDates: DateRange[];
}

import { useTranslations, useLocale } from "next-intl";
import { ar, fr, enUS } from 'date-fns/locale';

export default function AvailabilityCalendar({ reservedDates }: AvailabilityCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());
  const t = useTranslations('Availability');
  const localeStr = useLocale();

  const locales: Record<string, Locale> = { ar, fr, en: enUS };
  const currentLocale = locales[localeStr] || enUS;

  // Convert string dates to Date objects
  const disabledDays = reservedDates.map((range: DateRange) => ({
    from: new Date(range.startDate),
    to: new Date(range.endDate),
  }));

  return (
    <div className="availability-calendar-container">
      <h3>{t('title')}</h3>
      <p className="subtitle">{t('subtitle')}</p>
      
      <div className="calendar-wrapper">
        <DayPicker

          locale={currentLocale}
          dir={localeStr === 'ar' ? 'rtl' : 'ltr'}
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
            caption: {
               // Ensure caption doesn't overlap
            }
          }}
        />
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <span className="dot available"></span>
          <span>{t('available')}</span>
        </div>
        <div className="legend-item">
          <span className="dot new-booked" style={{ background: '#ccc', textDecoration: 'line-through' }}></span>
          <span>{t('booked')}</span>
        </div>
      </div>
    </div>
  );
}
