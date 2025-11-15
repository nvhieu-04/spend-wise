import { prisma } from "~/server/db";
import { type Transaction } from "@prisma/client";

export class StatisticsService {
  static async getOverview(userId: string) {
    // Tổng chi tiêu, tổng cashback, số lượng giao dịch theo tháng
    const now = new Date();
    const year = now.getFullYear();
    // Lấy tất cả giao dịch năm nay
    const allTransactions: Transaction[] = await prisma.transaction.findMany({
      where: {
        card: { userId },
        transactionDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31, 23, 59, 59),
        },
      },
    });
    const totalSpending = allTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCashback = allTransactions.reduce(
      (sum, t) => sum + (t.cashbackEarned ?? 0),
      0,
    );
    // Số lượng giao dịch theo tháng
    const transactionsByMonth: Record<string, number> = {};
    for (let m = 0; m < 12; m++) {
      transactionsByMonth[(m + 1).toString().padStart(2, "0")] = 0;
    }
    allTransactions.forEach((t) => {
      const month = (new Date(t.transactionDate).getMonth() + 1)
        .toString()
        .padStart(2, "0");
      if (transactionsByMonth[month] !== undefined) {
        transactionsByMonth[month]++;
      }
    });
    return {
      totalSpending,
      totalCashback,
      transactionsByMonth,
      totalTransactions: allTransactions.length,
    };
  }
}
