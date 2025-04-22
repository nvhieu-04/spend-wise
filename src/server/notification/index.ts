import { format } from 'date-fns';
import { prisma } from '~/lib/prisma';

export class NotificationService {
  static async getUpcomingPaymentNotifications(userId: string) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get all cards with payment due dates
    const cards = await prisma.bankCard.findMany({
      where: {
        userId,
        paymentDueDate: {
          not: null
        }
      },
      include: {
        transactions: {
          where: {
            isExpense: true,
            transactionDate: {
              gte: new Date(currentYear, currentMonth - 1, 1), // Last month
              lt: new Date(currentYear, currentMonth, 1) // Current month
            }
          }
        }
      }
    });

    const notifications = [];

    for (const card of cards) {
      if (!card.paymentDueDate) continue;

      // Calculate next payment due date
      let nextPaymentDate = new Date(currentYear, currentMonth, card.paymentDueDate);
      if (currentDay >= card.paymentDueDate) {
        nextPaymentDate = new Date(currentYear, currentMonth + 1, card.paymentDueDate);
      }

      // Calculate days until payment
      const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // If payment is due in 5 days or less
      if (daysUntilPayment <= 5 && daysUntilPayment > 0) {
        // Calculate total spending for the current statement period
        const totalSpending = card.transactions.reduce((sum, t) => sum + t.amount, 0);

        notifications.push({
          cardId: card.id,
          cardName: card.cardName,
          bankName: card.bankName,
          paymentDueDate: nextPaymentDate,
          daysUntilPayment,
          totalSpending,
          message: `Payment of ${totalSpending.toLocaleString()} VNĐ is due in ${daysUntilPayment} day${daysUntilPayment > 1 ? 's' : ''} for ${card.cardName} (${card.bankName})`
        });
      }
    }

    return notifications;
  }
} 