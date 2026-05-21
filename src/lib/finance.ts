import { toPersianNumber } from "./persian-numbers";

// ─── Deduction Rates ───────────────────────────────────────────────────────────

export const DEDUCTION_RATES = {
  insurance: 0.05,   // بیمه
  sandogh: 0.01,     // صندوق
  vahedBargh: 0.07,  // واحد برق
  afzodeh: 0.10,     // افزوده
} as const;

// ─── Deduction Result ──────────────────────────────────────────────────────────

export interface DeductionResult {
  /** Gross amount before deductions */
  amountSystem: number;
  /** 5% - بیمه */
  deduction1: number;
  /** 1% - صندوق */
  deduction2: number;
  /** 7% - واحد برق */
  deduction3: number;
  /** 10% - افزوده */
  deduction4: number;
  /** Net amount after all deductions */
  sumAmountSystem: number;
  /** Gross amount (same as amountSystem — kept for compatibility with DB column) */
  sumAmountWithFish: number;
}

// ─── Calculate Deductions ──────────────────────────────────────────────────────

export function calculateDeductions(grossAmount: number): DeductionResult {
  const d1 = grossAmount * DEDUCTION_RATES.insurance;
  const d2 = grossAmount * DEDUCTION_RATES.sandogh;
  const d3 = grossAmount * DEDUCTION_RATES.vahedBargh;
  const d4 = grossAmount * DEDUCTION_RATES.afzodeh;
  const totalDeductions = d1 + d2 + d3 + d4;
  return {
    amountSystem: grossAmount,
    deduction1: d1,
    deduction2: d2,
    deduction3: d3,
    deduction4: d4,
    sumAmountSystem: grossAmount - totalDeductions,
    sumAmountWithFish: grossAmount,
  };
}

// ─── Format Currency ───────────────────────────────────────────────────────────

/**
 * Format a numeric amount as a Persian-digit currency string.
 * @param amount - The numeric amount
 * @param unit   - "rial" (default) or "toman" (divides by 10)
 */
export function formatCurrency(
  amount: number,
  unit: "rial" | "toman" = "rial"
): string {
  const value = unit === "toman" ? Math.floor(amount / 10) : amount;
  const formatted = value.toLocaleString("en-US");
  const label = unit === "toman" ? "تومان" : "ریال";
  return `${toPersianNumber(formatted)} ${label}`;
}
