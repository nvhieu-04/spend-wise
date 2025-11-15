import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { FiBell, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { formatNumberWithDots } from "../../lib/utils";

interface Notification {
  cardId: string;
  cardName: string;
  bankName: string;
  paymentDueDate: string;
  daysUntilPayment: number;
  totalSpending: number;
  message: string;
}

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isUnread, setIsUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data);
        setIsUnread(data.length > 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
    const handleNotificationUpdate = (event: CustomEvent) => {
      setNotifications(event.detail);
      setIsUnread(event.detail.length > 0);
    };
    window.addEventListener(
      "notifications-updated",
      handleNotificationUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleNotificationUpdate as EventListener,
      );
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    setIsUnread(false);
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 transition-colors hover:text-blue-600 focus:outline-none ${isUnread ? "animate-shake" : ""}`}
        aria-label="Notifications"
      >
        <FiBell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-red-500"></span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FiBell className="text-blue-500" /> Notifications
              </h3>
              {notifications.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {notifications.length} new
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton height={56} borderRadius={12} count={3} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center">
                <FiCheckCircle className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">
                  No new notifications
                </p>
              </div>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.cardId}
                    className="group relative flex cursor-pointer items-start rounded-lg p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {notification.cardName}
                        </p>
                        <span className="ml-2 flex-shrink-0 text-xs font-medium text-blue-600">
                          {formatDistanceToNow(
                            new Date(notification.paymentDueDate),
                            { addSuffix: true, locale: undefined },
                          )}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-600">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Payment{" "}
                        {formatNumberWithDots(notification.totalSpending)} VND
                      </p>
                    </div>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <FiChevronRight className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
              <button className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-600">
                View all <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
