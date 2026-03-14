"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getDictionary, type Locale } from "~/i18n";
import { formatNumberWithDots, parseNumberFromFormatted } from "~/lib/utils";

interface OptimizerResultCard {
  id: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardColor?: string | null;
  estimatedCashback: number;
}

export default function CashbackOptimizerPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [merchantName, setMerchantName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bestCard, setBestCard] = useState<OptimizerResultCard | null>(null);
  const [alternatives, setAlternatives] = useState<OptimizerResultCard[]>([]);

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "");
    setAmount(formatNumberWithDots(numeric));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex h-40 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {dict.cashback.optimizerTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              {dict.cashback.optimizerDescription}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <p className="mb-4 text-sm text-gray-600">
              Vui lòng đăng nhập để sử dụng Cashback Optimizer.
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setBestCard(null);
    setAlternatives([]);

    try {
      const numericAmount = parseNumberFromFormatted(amount);
      const response = await fetch("/api/cashback-optimizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          categoryId: categoryId || null,
          merchantName: merchantName || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to optimize cashback");
      }

      if (data.bestCard) {
        setBestCard({
          ...data.bestCard,
          estimatedCashback: data.estimatedCashback,
        });
        setAlternatives(
          (data.alternatives ?? []).map((alt: any) => ({
            ...alt,
            estimatedCashback: alt.estimatedCashback,
          })),
        );
      } else {
        setBestCard(null);
        setAlternatives([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to optimize cashback",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {dict.cashback.optimizerTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {dict.cashback.optimizerDescription}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {dict.cashback.optimizerAmountLabel}
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 py-2 pr-12 pl-3 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={dict.cashback.optimizerAmountPlaceholder}
                required
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-gray-500 sm:text-sm">VNĐ</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {dict.cashback.optimizerMerchantLabel}
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={dict.cashback.optimizerMerchantPlaceholder}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? dict.cashback.optimizerSubmitting
                : dict.cashback.optimizerSubmit}
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {bestCard ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {dict.cashback.optimizerBestBadge}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900 sm:text-xl">
                {bestCard.cardName} · {bestCard.bankName}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {dict.cashback.optimizerBestLinePrefix}{" "}
                <span className="font-semibold text-emerald-700">
                  +{formatNumberWithDots(Math.round(bestCard.estimatedCashback))}{" "}
                  VNĐ
                </span>
              </p>
            </div>
          ) : (
            !isLoading && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                {dict.cashback.optimizerEmptyState}
              </div>
            )
          )}

          {alternatives.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base">
                {dict.cashback.optimizerAlternativesTitle}
              </h3>
              <div className="space-y-2">
                {alternatives.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {card.cardName}
                      </p>
                      <p className="text-xs text-gray-500">{card.bankName}</p>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700 sm:text-sm">
                      +{formatNumberWithDots(Math.round(card.estimatedCashback))}{" "}
                      VNĐ
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

