"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

interface PersianDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled,
  className,
}: PersianDatePickerProps) {
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      value={value ? new Date(value) : undefined}
      onChange={(date) => {
        if (date && !Array.isArray(date)) {
          const gregorian = (date as { toDate: () => Date }).toDate();
          onChange?.(gregorian.toISOString());
        }
      }}
      disabled={disabled}
      render={(val: string, openCalendar: () => void) => (
        <Input
          value={val}
          onClick={openCalendar}
          placeholder={placeholder}
          className={cn("cursor-pointer", className)}
          readOnly
          disabled={disabled}
        />
      )}
    />
  );
}
