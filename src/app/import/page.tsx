"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getDictionary, type Locale } from "~/i18n";
import { formatNumberWithDots } from "~/lib/utils";

interface BankCard {
  id: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumberLast4: string;
  cardColor?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface PreviewRow {
  transactionDate: string;
  amount: number;
  merchantName: string;
  suggestedCategoryId: string | null;
  isExpense: boolean;
  error?: string;
}

function parseCSV(text: string): string[][] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const rows: string[][] = [];
  for (const line of lines) {
    if (line.trim() === "") continue;
    const cells: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        let end = i + 1;
        while (end < line.length) {
          if (line[end] === '"' && line[end + 1] !== '"') break;
          if (line[end] === '"' && line[end + 1] === '"') end += 1;
          end += 1;
        }
        cells.push(line.slice(i + 1, end).replace(/""/g, '"'));
        i = end + 1;
        if (line[i] === ",") i += 1;
      } else {
        const comma = line.indexOf(",", i);
        if (comma === -1) {
          cells.push(line.slice(i).trim());
          break;
        }
        cells.push(line.slice(i, comma).trim());
        i = comma + 1;
      }
    }
    rows.push(cells);
  }
  return rows;
}

export default function ImportPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);

  const [step, setStep] = useState(1);
  const [cards, setCards] = useState<BankCard[]>([]);
  const [cardId, setCardId] = useState("");
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [skipHeader, setSkipHeader] = useState(true);
  const [mapping, setMapping] = useState({ date: 0, amount: 1, description: 2 });
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number;
    failed?: { index: number; error: string }[];
  } | null>(null);

  const cardIdFromUrl = searchParams.get("cardId");

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/bank-cards?pageSize=100")
      .then((r) => r.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]));
  }, [session?.user?.id]);

  useEffect(() => {
    if (cardIdFromUrl && cards.length > 0) {
      const exists = cards.some((c) => c.id === cardIdFromUrl);
      if (exists) setCardId(cardIdFromUrl);
    }
  }, [cardIdFromUrl, cards]);

  useEffect(() => {
    if (!cardId) return;
    fetch(`/api/categories?cardId=${cardId}`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, [cardId]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = (reader.result as string) ?? "";
          const rows = parseCSV(text);
          setCsvRows(rows);
          const first = rows[0];
          if (rows.length > 0 && first && first.length > 0) {
            setMapping({ date: 0, amount: 1, description: Math.min(2, first.length - 1) });
          }
        } catch {
          setError("Invalid CSV");
        }
      };
      reader.readAsText(file, "UTF-8");
    },
    [],
  );

  const dataRows = skipHeader && csvRows.length > 0 ? csvRows.slice(1) : csvRows;
  const columnCount = csvRows[0]?.length ?? 0;

  const loadPreview = useCallback(async () => {
    if (!cardId || dataRows.length === 0) return;
    setIsLoadingPreview(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, rows: dataRows, mapping }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.import.fetchPreviewError);
      setPreviewRows(data.rows ?? []);
      setCategoryOverrides({});
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.import.fetchPreviewError);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [cardId, dataRows, mapping, dict.import.fetchPreviewError]);

  const setCategoryForRow = useCallback((rowIndex: number, categoryId: string) => {
    setCategoryOverrides((prev) =>
      categoryId ? { ...prev, [rowIndex]: categoryId } : (() => {
        const next = { ...prev };
        delete next[rowIndex];
        return next;
      })(),
    );
  }, []);

  const handleImport = useCallback(async () => {
    if (!cardId || previewRows.length === 0) return;
    setIsImporting(true);
    setError(null);
    setImportResult(null);
    try {
      const transactions = previewRows
        .filter((r) => !r.error && r.transactionDate)
        .map((r, i) => ({
          transactionDate: r.transactionDate,
          amount: r.amount,
          merchantName: r.merchantName || undefined,
          categoryId: categoryOverrides[i] ?? r.suggestedCategoryId ?? null,
        }));
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, transactions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.import.importError);
      setImportResult({ created: data.created, failed: data.failed });
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.import.importError);
    } finally {
      setIsImporting(false);
    }
  }, [cardId, previewRows, categoryOverrides, dict.import.importError]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-40 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    const signInHref = "/api/auth/signin";
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900">{dict.import.title}</h1>
          <p className="mt-1 text-gray-600">{dict.import.description}</p>
          <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <p className="mb-4 text-sm text-gray-600">Please sign in to use Import.</p>
            <Link
              href={signInHref}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {dict.common.signIn}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const importHref = locale === "vn" ? "/vn/import" : "/en/import";

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {dict.import.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {dict.import.description}
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                step === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === 1 && dict.import.step1Title}
              {s === 2 && dict.import.step2Title}
              {s === 3 && dict.import.step3Title}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {importResult && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-medium text-emerald-800">
              {dict.import.successCount.replace("{count}", String(importResult.created))}
            </p>
            {importResult.failed && importResult.failed.length > 0 && (
              <ul className="mt-1 text-xs text-emerald-700">
                {importResult.failed.slice(0, 5).map((f) => (
                  <li key={f.index}>
                    {dict.import.errorRow
                      .replace("{row}", String(f.index + 1))
                      .replace("{message}", f.error)}
                  </li>
                ))}
                {importResult.failed.length > 5 && (
                  <li>... and {importResult.failed.length - 5} more</li>
                )}
              </ul>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {dict.import.step1Title}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {dict.import.selectCard}
                </label>
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{dict.import.selectCardPlaceholder}</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cardName} · {c.bankName} ****{c.cardNumberLast4}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {dict.import.uploadCsv}
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">{dict.import.uploadCsvHint}</p>
                {csvRows.length > 0 && (
                  <p className="mt-1 text-xs text-emerald-600">
                    {csvRows.length} rows loaded
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!cardId || csvRows.length === 0}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {dict.import.step2Title}
            </h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skipHeader}
                  onChange={(e) => setSkipHeader(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{dict.import.skipHeader}</span>
              </label>
              {csvRows[0] && (
                <div className="overflow-x-auto">
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    First row (header): {csvRows[0].join(" | ")}
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {dict.import.mapDate}
                  </label>
                  <select
                    value={mapping.date}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, date: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {Array.from({ length: columnCount }, (_, i) => (
                      <option key={i} value={i}>
                        Col {i + 1} {csvRows[0]?.[i] ? `(${String(csvRows[0][i]).slice(0, 15)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {dict.import.mapAmount}
                  </label>
                  <select
                    value={mapping.amount}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, amount: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {Array.from({ length: columnCount }, (_, i) => (
                      <option key={i} value={i}>
                        Col {i + 1} {csvRows[0]?.[i] ? `(${String(csvRows[0][i]).slice(0, 15)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {dict.import.mapDescription}
                  </label>
                  <select
                    value={mapping.description}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, description: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {Array.from({ length: columnCount }, (_, i) => (
                      <option key={i} value={i}>
                        Col {i + 1} {csvRows[0]?.[i] ? `(${String(csvRows[0][i]).slice(0, 15)})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={loadPreview}
                disabled={isLoadingPreview || dataRows.length === 0}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isLoadingPreview ? "Loading..." : "Load preview"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {dict.import.previewTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {previewRows.length} rows. Adjust category if needed, then import.
            </p>
            <div className="mt-4 max-h-[400px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="py-2 pr-2 font-medium text-gray-700">Date</th>
                    <th className="py-2 pr-2 font-medium text-gray-700">Amount</th>
                    <th className="py-2 pr-2 font-medium text-gray-700">Description</th>
                    <th className="py-2 font-medium text-gray-700">
                      {dict.import.suggestedCategory}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className={row.error ? "bg-red-50" : ""}
                    >
                      <td className="py-1.5 pr-2 text-gray-900">
                        {row.transactionDate
                          ? new Date(row.transactionDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-1.5 pr-2 font-medium text-gray-900">
                        {formatNumberWithDots(Math.round(row.amount))} VNĐ
                      </td>
                      <td className="py-1.5 pr-2 text-gray-600 max-w-[200px] truncate">
                        {row.merchantName || "—"}
                      </td>
                      <td className="py-1.5">
                        {row.error ? (
                          <span className="text-red-600 text-xs">{row.error}</span>
                        ) : (
                          <select
                            value={categoryOverrides[i] ?? row.suggestedCategoryId ?? ""}
                            onChange={(e) =>
                              setCategoryForRow(i, e.target.value)
                            }
                            className="rounded border border-gray-200 px-2 py-1 text-xs"
                          >
                            <option value="">{dict.import.categoryPlaceholder}</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={
                  isImporting ||
                  previewRows.filter((r) => !r.error && r.transactionDate).length === 0
                }
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isImporting
                  ? dict.import.importing
                  : dict.import.confirmImport}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
