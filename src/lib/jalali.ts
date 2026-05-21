import { format, newDate } from "date-fns-jalali";
import { toPersianNumber } from "./persian-numbers";

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند",
];

export function formatJalaliDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("/");
  const monthName = JALALI_MONTHS[parseInt(month) - 1];
  return `${toPersianNumber(day)} ${monthName} ${toPersianNumber(year)}`;
}

export function formatJalaliDateShort(dateStr: string): string {
  return toPersianNumber(dateStr);
}

export function getJalaliYear(dateStr: string): string {
  return toPersianNumber(dateStr.split("/")[0]);
}

export function getJalaliMonth(dateStr: string): string {
  const month = parseInt(dateStr.split("/")[1]);
  return JALALI_MONTHS[month - 1];
}

export function sortByJalaliDate(a: string, b: string): number {
  const parseDate = (d: string) => d.split("/").map(Number);
  const [ay, am, ad] = parseDate(a);
  const [by, bm, bd] = parseDate(b);
  if (ay !== by) return by - ay;
  if (am !== bm) return bm - am;
  return bd - ad;
}

// ─── date-fns-jalali based helpers ────────────────────────────────────────────

/**
 * Convert a Gregorian Date (or ISO string) to a Jalali date string "YYYY/MM/DD".
 */
export function toJalali(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy/MM/dd");
}

/**
 * Convert a Jalali string "YYYY/MM/DD" to a Gregorian Date.
 */
export function fromJalali(jalali: string): Date {
  const parts = jalali.split("/").map(Number);
  const year = parts[0] ?? 1400;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  // newDate uses 0-based month index
  return newDate(year, month - 1, day);
}

/**
 * Format a UTC ISO string as a Persian date for display.
 * If includeTime is true, appends HH:mm.
 */
export function formatPersianDate(isoString: string, includeTime = false): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const jalaliStr = toJalali(d);
  const formatted = formatJalaliDate(jalaliStr);
  if (!includeTime) return formatted;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatted} - ${toPersianNumber(hh)}:${toPersianNumber(mm)}`;
}

/**
 * Get the current date as a Jalali string "YYYY/MM/DD".
 */
export function todayJalali(): string {
  return toJalali(new Date());
}
