import React, { useEffect, useState } from "react";
import { format } from "date-fns";

interface PaymentNotification {
  cardId: string;
  cardName: string;
  bankName: string;
  paymentDueDate: string;
  daysUntilPayment: number;
  totalSpending: number;
  message: string;
}

export default function PaymentNotification() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Fetch notifications on mount
    fetchNotifications();

    // Listen for notification updates
    const handleNotificationUpdate = (event: CustomEvent) => {
      setNotifications(event.detail);
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

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-2 py-2 sm:px-4 sm:py-3">
      {notifications.map((notification) => (
        <div
          key={notification.cardId}
          className="mb-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:mb-3 sm:p-4"
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <p className="text-xs font-medium text-gray-900 sm:text-sm">
                  Payment Reminder
                </p>
                <p className="mt-0.5 text-xs font-medium text-blue-600 sm:mt-0 sm:text-sm">
                  Due in {notification.daysUntilPayment} days
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                {notification.message}
              </p>
              <p className="mt-1 text-[10px] text-gray-500 sm:mt-2 sm:text-xs">
                Due date:{" "}
                {format(new Date(notification.paymentDueDate), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
