import { prisma } from "~/server/db";

export class StatisticsService {
  static async getOverview(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const allTransactions = await prisma.transaction.findMany({
      where: {
        card: { userId },
        transactionDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31, 23, 59, 59),
        },
      },
      include: {
        card: true,
        category: true,
      },
    });
    const totalSpending = allTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCashback = allTransactions.reduce(
      (sum, t) => sum + (t.cashbackEarned ?? 0),
      0,
    );
    const transactionsByMonth: Record<string, number> = {};
    const spendingByMonth: Record<string, number> = {};
    for (let m = 0; m < 12; m++) {
      transactionsByMonth[(m + 1).toString().padStart(2, "0")] = 0;
      spendingByMonth[(m + 1).toString().padStart(2, "0")] = 0;
    }

    const spendingByCard: Record<
      string,
      {
        cardId: string;
        cardName: string;
        bankName: string;
        totalSpending: number;
      }
    > = {};

    const spendingByCategory: Record<
      string,
      {
        categoryId: string;
        name: string;
        totalSpending: number;
      }
    > = {};

    const spendingByMerchant: Record<string, number> = {};

    allTransactions.forEach((t) => {
      const month = (new Date(t.transactionDate).getMonth() + 1)
        .toString()
        .padStart(2, "0");
      if (transactionsByMonth[month] !== undefined) {
        transactionsByMonth[month]++;
      }

      if (t.isExpense && spendingByMonth[month] !== undefined) {
        spendingByMonth[month] += t.amount;
      }

      if (t.isExpense && t.card) {
        if (!spendingByCard[t.cardId]) {
          spendingByCard[t.cardId] = {
            cardId: t.cardId,
            cardName: t.card.cardName,
            bankName: t.card.bankName,
            totalSpending: 0,
          };
        }
        spendingByCard[t.cardId]!.totalSpending += t.amount;
      }

      if (t.isExpense && t.category) {
        if (!spendingByCategory[t.categoryId!]) {
          spendingByCategory[t.categoryId!] = {
            categoryId: t.categoryId!,
            name: t.category.name,
            totalSpending: 0,
          };
        }
        spendingByCategory[t.categoryId!]!.totalSpending += t.amount;
      }

      if (t.isExpense) {
        const merchantKey = t.merchantName?.trim() || "Unknown";
        if (!spendingByMerchant[merchantKey]) {
          spendingByMerchant[merchantKey] = 0;
        }
        spendingByMerchant[merchantKey] += t.amount;
      }
    });

    const spendingByMonthArray = Object.entries(spendingByMonth).map(
      ([month, total]) => ({
        month,
        totalSpending: total,
      }),
    );

    const spendingByCardArray = Object.values(spendingByCard).sort(
      (a, b) => b.totalSpending - a.totalSpending,
    );

    const spendingByCategoryArray = Object.values(spendingByCategory).sort(
      (a, b) => b.totalSpending - a.totalSpending,
    );

    const topMerchants = Object.entries(spendingByMerchant)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([merchantName, totalSpending]) => ({
        merchantName,
        totalSpending,
      }));

    return {
      totalSpending,
      totalCashback,
      transactionsByMonth,
      totalTransactions: allTransactions.length,
      spendingByMonth: spendingByMonthArray,
      spendingByCard: spendingByCardArray,
      spendingByCategory: spendingByCategoryArray,
      topMerchants,
    };
  }
}
