"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getDictionary, type Locale } from "~/i18n";

interface Bank {
  short_name: string;
  bin: string;
}

interface QrTemplate {
  id: string;
  name: string;
  acqId: string;
  accountNo: string;
  accountName: string;
  addInfo: string | null;
}

interface QrHistoryItem {
  id: string;
  acqId: string;
  accountNo: string;
  accountName: string;
  amount: number | null;
  addInfo: string | null;
  createdAt: string;
}

export default function QrPage() {
  const { data: session } = useSession();
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");
  const [acqId, setAcqId] = useState("");
  const [amount, setAmount] = useState("");
  const [addInfo, setAddInfo] = useState("");
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [templates, setTemplates] = useState<QrTemplate[]>([]);
  const [history, setHistory] = useState<QrHistoryItem[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const pathname = usePathname();

  const locale: Locale = pathname?.startsWith("/vn") ? "vn" : pathname?.startsWith("/en") ? "en" : "en";
  const dict = getDictionary(locale);
  const backHref = locale === "en" || locale === "vn" ? `/${locale}` : "/";
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoadingBanks(true);
        const res = await fetch("https://api.vietqr.io/v2/banks");
        const data = await res.json();
        if (res.ok && Array.isArray(data.data)) {
          setBanks(
            data.data.map((b: any) => ({
              short_name: b.short_name,
              bin: String(b.bin),
            })),
          );
        }
      } catch (e) {
        // silent fail, user vẫn có thể tự nhập BIN
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const load = async () => {
      try {
        const [tRes, hRes] = await Promise.all([
          fetch("/api/qr/templates"),
          fetch("/api/qr/history"),
        ]);
        if (tRes.ok) {
          const data = await tRes.json();
          setTemplates(Array.isArray(data) ? data : []);
        }
        if (hRes.ok) {
          const data = await hRes.json();
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      }
    };
    void load();
  }, [isLoggedIn]);

  const applyToForm = (item: {
    acqId: string;
    accountNo: string;
    accountName: string;
    amount?: number | null;
    addInfo?: string | null;
  }) => {
    setAcqId(item.acqId);
    setAccountNo(item.accountNo);
    setAccountName(item.accountName);
    setAmount(item.amount != null ? String(item.amount) : "");
    setAddInfo(item.addInfo ?? "");
  };

  const handleSaveAsTemplate = async () => {
    const name = templateName.trim();
    if (!name || !accountNo || !accountName || !acqId) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/qr/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          acqId,
          accountNo,
          accountName,
          addInfo: addInfo || undefined,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setTemplates((prev) => [created, ...prev]);
        setShowSaveTemplate(false);
        setTemplateName("");
      }
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQrDataURL(null);
    if (!accountNo || !accountName || !acqId) {
      setError(dict.qr.errorMissingFields);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNo,
          accountName,
          acqId: Number(acqId),
          amount: amount ? Number(amount.replace(/[^\d]/g, "")) : undefined,
          addInfo,
          template: "compact",
          format: "text",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || dict.qr.errorCreateFailed);
        return;
      }
      setQrDataURL(data.qrDataURL || null);
      if (isLoggedIn) {
        const hRes = await fetch("/api/qr/history");
        if (hRes.ok) {
          const list = await hRes.json();
          setHistory(Array.isArray(list) ? list : []);
        }
      }
    } catch (err) {
      setError(dict.qr.errorApi);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-blue-600"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {dict.common.backToCards}
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {dict.qr.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {dict.qr.description}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isLoggedIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {dict.qr.templatesTitle}
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const t = templates.find((x) => x.id === id);
                    if (t) applyToForm(t);
                    e.target.value = "";
                  }}
                >
                  <option value="">{dict.qr.templatePlaceholder}</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dict.qr.bankLabel}
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={acqId ? acqId : ""}
                onChange={(e) => setAcqId(e.target.value)}
                disabled={isLoadingBanks || banks.length === 0}
              >
                <option value="">
                  {isLoadingBanks
                    ? dict.qr.bankPlaceholderLoading
                    : dict.qr.bankPlaceholder}
                </option>
                {banks.map((bank) => (
                  <option key={bank.bin} value={bank.bin}>
                    {bank.short_name} ({bank.bin})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dict.qr.accountNumberLabel}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={accountNo}
                onChange={(e) =>
                  setAccountNo(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder={dict.qr.accountNumberPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dict.qr.accountNameLabel}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder={dict.qr.accountNamePlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dict.qr.amountLabel}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder={dict.qr.amountPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {dict.qr.addInfoLabel}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={addInfo}
                onChange={(e) => setAddInfo(e.target.value)}
                placeholder={dict.qr.addInfoPlaceholder}
                maxLength={25}
              />
            </div>
            {isLoggedIn && accountNo && accountName && acqId && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSaveTemplate(true)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  {dict.qr.saveAsTemplate}
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
                {isLoading ? dict.qr.submitCreating : dict.qr.submit}
            </button>
          </form>
          <div className="flex flex-col items-center justify-center space-y-3">
            {qrDataURL ? (
              <>
                <img
                  src={qrDataURL}
                  alt="VietQR"
                  className="h-52 w-52 rounded-xl border border-gray-200 bg-white object-contain sm:h-60 sm:w-60"
                />
                <a
                  href={qrDataURL}
                  download="vietqr.png"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:text-sm"
                >
                  {dict.qr.saveQr}
                </a>
              </>
            ) : (
              <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-500 sm:h-60 sm:w-60 sm:text-sm">
                  {dict.qr.qrPreviewPlaceholder}
              </div>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <section className="mt-8 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {dict.qr.historyTitle}
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">{dict.qr.noHistory}</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span className="truncate">
                      {item.accountName} • {item.accountNo}
                      {item.amount != null && ` • ${item.amount.toLocaleString("vi-VN")} đ`}
                      {item.addInfo && ` • ${item.addInfo}`}
                    </span>
                    <span className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => applyToForm(item)}
                        className="text-blue-600 hover:underline"
                      >
                        {dict.qr.useAgain}
                      </button>
                      <button
                        type="button"
                        onClick={() => applyToForm(item)}
                        className="text-blue-600 hover:underline"
                      >
                        {dict.qr.recreate}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {showSaveTemplate && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
              <label className="block text-sm font-medium text-gray-700">
                {dict.qr.saveAsTemplate}
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder={dict.qr.templateNamePlaceholder}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                autoFocus
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName("");
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {dict.dialogs.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim() || savingTemplate}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingTemplate ? dict.dialogs.common.saving : dict.qr.saveAsTemplate}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

