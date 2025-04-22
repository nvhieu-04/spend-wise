import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatNumberWithDots } from '../../lib/utils';

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
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Fetch notifications on mount
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

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-3">
      {notifications.map((notification) => (
        <div key={notification.cardId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
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
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-900">
                  Payment Reminder
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Due in {notification.daysUntilPayment} days
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Due date: {format(new Date(notification.paymentDueDate), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 