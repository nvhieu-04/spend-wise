import { formatNumberWithDots } from "~/lib/utils";

export type PaymentReminderNotification = {
  type: "payment_reminder";
  cardId: string;
  cardName: string;
  bankName: string;
  paymentDueDate: Date | string;
  daysUntilPayment: number;
  totalSpending: number;
};

type NotificationDict = {
  dueToday: string;
  dueTomorrow: string;
  dueInDays: string;
  paymentMessage: string;
};

export function getPaymentReminderDueText(
  dict: NotificationDict,
  daysUntilPayment: number,
): string {
  if (daysUntilPayment <= 0) return dict.dueToday;
  if (daysUntilPayment === 1) return dict.dueTomorrow;
  return dict.dueInDays.replace("{days}", String(daysUntilPayment));
}

export function getPaymentReminderMessage(
  dict: NotificationDict,
  notification: PaymentReminderNotification,
): string {
  const amount = formatNumberWithDots(notification.totalSpending);
  const dueText = getPaymentReminderDueText(
    dict,
    notification.daysUntilPayment,
  );
  return dict.paymentMessage
    .replace("{amount}", amount)
    .replace("{dueText}", dueText)
    .replace("{cardName}", notification.cardName)
    .replace("{bankName}", notification.bankName);
}
