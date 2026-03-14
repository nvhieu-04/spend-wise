 "use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      setError("Vui lòng nhập đủ Số tài khoản, Tên tài khoản và chọn Ngân hàng.");
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
        setError(data.error || "Không thể tạo mã QR");
        return;
      }
      setQrDataURL(data.qrDataURL || null);
    } catch (err) {
      setError("Có lỗi xảy ra khi gọi VietQR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <Link
            href="/"
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
            Back to Cards
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            QR Payment
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Tạo mã VietQR để nhận chuyển khoản nhanh. Nhập thông tin tài khoản, số tiền và nội dung.
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
                Ngân hàng
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={acqId ? acqId : ""}
                onChange={(e) => setAcqId(e.target.value)}
                disabled={isLoadingBanks || banks.length === 0}
              >
                <option value="">
                  {isLoadingBanks
                    ? "Đang tải danh sách ngân hàng..."
                    : "Chọn ngân hàng (hoặc tự nhập BIN bên dưới)"}
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
                Số tài khoản
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={accountNo}
                onChange={(e) =>
                  setAccountNo(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Nhập số tài khoản nhận tiền"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên tài khoản (in hoa, không dấu)
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số tiền (VNĐ) - có thể bỏ trống
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Ví dụ: 100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nội dung chuyển khoản (tối đa 25 ký tự, không dấu)
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={addInfo}
                onChange={(e) => setAddInfo(e.target.value)}
                placeholder="Noi dung chuyen tien"
                maxLength={25}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {isLoading ? "Đang tạo QR..." : "Tạo mã QR"}
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
                  Lưu ảnh QR
                </a>
              </>
            ) : (
              <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-500 sm:h-60 sm:w-60 sm:text-sm">
                QR preview will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

