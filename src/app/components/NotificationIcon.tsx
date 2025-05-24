import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatNumberWithDots } from '../../lib/utils';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Listen for notification updates
    const handleNotificationUpdate = (event: CustomEvent) => {
      setNotifications(event.detail);
    };

    window.addEventListener('notifications-updated', handleNotificationUpdate as EventListener);

    return () => {
      window.removeEventListener('notifications-updated', handleNotificationUpdate as EventListener);
    };
  }, []);

  return (
    <div className="relative static md:relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 md:right-0 left-0 md:left-auto mx-2 md:mx-0 mt-3 w-auto sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Reminders</h3>
              {notifications.length > 0 && (
                <span className="px-2 sm:px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {notifications.length} pending
                </span>
              )}
            </div>
            
            {isLoading ? (
              <Skeleton count={3} className="h-12 sm:h-16" />
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 sm:py-6">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-3 sm:mt-4 text-sm text-gray-500">No upcoming payments</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.cardId}
                    className="flex items-start p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
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
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {notification.cardName}
                        </p>
                        <span className="text-xs text-blue-600 font-medium ml-2 flex-shrink-0">
                          {notification.daysUntilPayment} days left
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate">
                        Payment of {formatNumberWithDots(notification.totalSpending)} VNĐ
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Due date: {format(new Date(notification.paymentDueDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 