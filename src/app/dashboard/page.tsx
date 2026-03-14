/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { formatNumberWithDots } from "~/lib/utils";
import { getDictionary, type Locale } from "~/i18n";

interface SpendingByMonthItem {
  month: string;
  totalSpending: number;
}

interface SpendingByCardItem {
  cardId: string;
  cardName: string;
  bankName: string;
  totalSpending: number;
}

interface SpendingByCategoryItem {
  categoryId: string;
  name: string;
  totalSpending: number;
}

interface TopMerchantItem {
  merchantName: string;
  totalSpending: number;
}

interface OverviewResponse {
  totalSpending: number;
  totalCashback: number;
  totalTransactions: number;
  spendingByMonth: SpendingByMonthItem[];
  spendingByCard: SpendingByCardItem[];
  spendingByCategory: SpendingByCategoryItem[];
  topMerchants: TopMerchantItem[];
}

const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);
  const manageCardsHref =
    locale === "en" || locale === "vn" ? `/${locale}` : "/";

  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/statistics/overview");
        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const data = (await res.json()) as OverviewResponse;
        setOverview(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-7 w-40 animate-pulse rounded bg-gray-100" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-28 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[1, 2].map((key) => (
              <div
                key={key}
                className="h-72 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {dict.dashboard.notLoggedInTitle}
          </h1>
          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            {dict.dashboard.notLoggedInDescription}
          </p>
          <Link
            href="/api/auth/signin"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            {dict.common.signIn}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {dict.dashboard.title}
          </h1>
          <p className="mt-3 text-sm text-red-600 sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !overview) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-7 w-40 animate-pulse rounded bg-gray-100" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-28 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const monthLabels = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const spendingByMonthData = monthLabels.map((month) => {
    const item = overview.spendingByMonth.find((m) => m.month === month);
    return {
      month,
      totalSpending: item?.totalSpending ?? 0,
    };
  });

  const topCategoryData = overview.spendingByCategory.slice(0, 6);
  const topMerchantsData = overview.topMerchants.slice(0, 5);

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {dict.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              {dict.dashboard.description}
            </p>
          </div>
          <Link
            href={manageCardsHref}
            className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:text-sm"
          >
            {dict.dashboard.manageCards}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {dict.dashboard.totalSpendingYear}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {formatNumberWithDots(Math.round(overview.totalSpending))} VND
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {dict.dashboard.totalCashback}
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {formatNumberWithDots(Math.round(overview.totalCashback))} VND
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {dict.dashboard.totalTransactions}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {formatNumberWithDots(overview.totalTransactions)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {dict.dashboard.spendingByMonthTitle}
              </p>
              <p className="text-xs text-gray-500">
                {dict.dashboard.spendingByMonthUnit}
              </p>
            </div>
            <div className="h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `${formatNumberWithDots(Math.round(value))} VND`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSpending"
                    name={dict.dashboard.spendingLabel}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {dict.dashboard.spendingByCardTitle}
              </p>
              <p className="text-xs text-gray-500">
                {dict.dashboard.spendingByCardSubtitle}
              </p>
            </div>
            <div className="h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={overview.spendingByCard.slice(0, 5)}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="cardName"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `${formatNumberWithDots(Math.round(value))} VND`
                    }
                    labelFormatter={(label: string) => label}
                  />
                  <Bar
                    dataKey="totalSpending"
                    name={dict.dashboard.spendingLabel}
                    fill="#6366F1"
                    radius={[4, 4, 4, 4]}
                  />
                </BarChart>
              </ResponsiveContainer>
          </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {dict.dashboard.categoryAllocationTitle}
              </p>
              <p className="text-xs text-gray-500">
                {dict.dashboard.categoryAllocationSubtitle}
              </p>
            </div>
            <div className="h-64 w-full sm:h-72">
              {topCategoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  {dict.dashboard.noCategoryData}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: number, _name, props) =>
                        `${formatNumberWithDots(Math.round(value))} VND`
                      }
                    />
                    <Legend />
                    <Pie
                      data={topCategoryData}
                      dataKey="totalSpending"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {topCategoryData.map((entry, index) => (
                        <Cell
                          key={entry.categoryId}
                          fill={
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">
                {dict.dashboard.topMerchantsTitle}
              </p>
              <p className="text-xs text-gray-500">
                {dict.dashboard.topMerchantsSubtitle}
              </p>
            </div>
            <div className="space-y-3">
              {topMerchantsData.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {dict.dashboard.noMerchantData}
                </p>
              ) : (
                topMerchantsData.map((merchant) => (
                  <div
                    key={merchant.merchantName}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {merchant.merchantName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumberWithDots(
                        Math.round(merchant.totalSpending),
                      )}{" "}
                      VND
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

