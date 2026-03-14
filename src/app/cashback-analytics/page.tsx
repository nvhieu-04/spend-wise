"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "~/i18n";
import { formatNumberWithDots } from "~/lib/utils";

interface PerCardPerMonth {
  cardId: string;
  cardName: string;
  bankName: string;
  month: string;
  totalCashback: number;
}

interface TotalPerMonth {
  month: string;
  totalCashback: number;
}

interface AnalyticsCardInfo {
  id: string;
  cardName: string;
  bankName: string;
  cardColor?: string | null;
}

export default function CashbackAnalyticsPage() {
  const pathname = usePathname();
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perCardPerMonth, setPerCardPerMonth] = useState<PerCardPerMonth[]>([]);
  const [totalPerMonth, setTotalPerMonth] = useState<TotalPerMonth[]>([]);
  const [cards, setCards] = useState<AnalyticsCardInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"perCard" | "compare" | "timeline">(
    "perCard",
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/cashback-analytics");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to fetch analytics");
        }

        setPerCardPerMonth(data.perCardPerMonth ?? []);
        setTotalPerMonth(data.totalPerMonth ?? []);
        setCards(data.cards ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const uniqueMonths = Array.from(
    new Set(perCardPerMonth.map((item) => item.month)),
  ).sort();

  const cardById = new Map(cards.map((card) => [card.id, card]));

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Cashback Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Tổng quan hoàn tiền theo thẻ và theo thời gian.
          </p>
        </div>

        <div className="mb-4 flex gap-2 rounded-full bg-gray-50 p-1 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("perCard")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
              activeTab === "perCard"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cashback theo thẻ
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
              activeTab === "compare"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            So sánh giữa các thẻ
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${
              activeTab === "timeline"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cashback theo thời gian
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">Đang tải dữ liệu cashback...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === "perCard" && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base">
                  Tổng cashback theo thẻ / tháng
                </h2>
                {uniqueMonths.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Chưa có dữ liệu hoàn tiền.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-gray-700 sm:text-sm">
                      <thead>
                        <tr>
                          <th className="border-b px-3 py-2 font-medium">
                            Tháng
                          </th>
                          {cards.map((card) => (
                            <th
                              key={card.id}
                              className="border-b px-3 py-2 font-medium"
                            >
                              {card.cardName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uniqueMonths.map((month) => (
                          <tr key={month} className="border-b last:border-b-0">
                            <td className="px-3 py-2 text-gray-900">{month}</td>
                            {cards.map((card) => {
                              const entry = perCardPerMonth.find(
                                (item) =>
                                  item.cardId === card.id &&
                                  item.month === month,
                              );
                              return (
                                <td
                                  key={card.id}
                                  className="px-3 py-2 text-right text-xs text-emerald-700 sm:text-sm"
                                >
                                  {entry
                                    ? `+${formatNumberWithDots(Math.round(entry.totalCashback))} VNĐ`
                                    : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "compare" && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base">
                  Tổng cashback theo thẻ (tất cả thời gian)
                </h2>
                {cards.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Chưa có dữ liệu hoàn tiền.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cards.map((card) => {
                      const total = perCardPerMonth
                        .filter((item) => item.cardId === card.id)
                        .reduce(
                          (sum, item) => sum + (item.totalCashback ?? 0),
                          0,
                        );
                      if (!total) return null;
                      return (
                        <div
                          key={card.id}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {card.cardName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {card.bankName}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-emerald-700 sm:text-sm">
                            +{formatNumberWithDots(Math.round(total))} VNĐ
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base">
                  Cashback theo thời gian (tất cả thẻ)
                </h2>
                {totalPerMonth.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Chưa có dữ liệu hoàn tiền.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {totalPerMonth.map((item) => (
                      <div
                        key={item.month}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <p className="text-gray-900">{item.month}</p>
                        <p className="text-xs font-semibold text-emerald-700 sm:text-sm">
                          +{formatNumberWithDots(Math.round(item.totalCashback))}{" "}
                          VNĐ
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

