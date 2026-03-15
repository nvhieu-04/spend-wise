import { parse, isValid } from "date-fns";

const DATE_FORMATS = [
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyy-MM-dd",
  "d/M/yyyy",
  "d-M-yyyy",
  "yyyy-M-d",
];

function parseDate(value: string): { date: Date | null; error?: string } {
  const trimmed = value?.trim();
  if (!trimmed) return { date: null, error: "Empty date" };

  for (const fmt of DATE_FORMATS) {
    try {
      const d = parse(trimmed, fmt, new Date());
      if (isValid(d)) return { date: d };
    } catch {
      continue;
    }
  }
  return { date: null, error: "Invalid date format" };
}

function parseAmount(value: string): { amount: number; error?: string } {
  const trimmed = value?.trim();
  if (trimmed === "" || trimmed == null) return { amount: 0, error: "Empty amount" };

  const cleaned = trimmed.replace(/\s/g, "").replace(/,/g, ".");
  const hasMinus = cleaned.startsWith("-");
  const digits = cleaned.replace(/^-?/, "").replace(/[^\d.]/g, "");
  const num = parseFloat(digits);
  if (Number.isNaN(num)) return { amount: 0, error: "Invalid amount" };

  const amount = hasMinus ? -num : num;
  return { amount };
}

export interface ColumnMapping {
  date: number;
  amount: number;
  description: number;
}

export interface ParsedRow {
  transactionDate: string;
  amount: number;
  merchantName: string;
  suggestedCategoryId: string | null;
  isExpense: boolean;
  error?: string;
}

export function parseRow(
  row: string[],
  mapping: ColumnMapping,
): Omit<ParsedRow, "suggestedCategoryId"> & { suggestedCategoryId?: string | null } {
  const dateVal = row[mapping.date] ?? "";
  const amountVal = row[mapping.amount] ?? "";
  const descVal = (row[mapping.description] ?? "").trim();

  const { date, error: dateError } = parseDate(dateVal);
  const { amount, error: amountError } = parseAmount(amountVal);
  const error = dateError ?? amountError;

  return {
    transactionDate: date ? date.toISOString() : "",
    amount: error ? 0 : amount,
    merchantName: descVal,
    isExpense: amount < 0,
    ...(error && { error }),
    suggestedCategoryId: undefined,
  };
}

export { parseDate, parseAmount };
