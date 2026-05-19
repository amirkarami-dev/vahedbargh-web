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
