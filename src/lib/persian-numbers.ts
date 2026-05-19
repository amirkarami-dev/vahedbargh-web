const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function toLatinNumber(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
}

export function formatPersianNumber(num: number): string {
  const formatted = num.toLocaleString("en-US");
  return toPersianNumber(formatted);
}

export function formatCurrency(amount: number, unit = "تومان"): string {
  const formatted = formatPersianNumber(amount);
  return `${formatted} ${unit}`;
}
