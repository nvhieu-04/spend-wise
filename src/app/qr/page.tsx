"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "~/i18n";

interface Bank {
  short_name: string;
  bin: string;
}

export default function QrPage() {
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
  const pathname = usePathname();

  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);
  const backHref = locale === "en" || locale === "vn" ? `/${locale}` : "/";

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
      </div>
    </div>
  );
}

