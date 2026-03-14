import { prisma } from "~/server/db";
import { type CashbackPolicy } from "@prisma/client";

export class CashbackPolicyService {
  static async getUserPolicies(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [policies, total] = await Promise.all([
      prisma.cashbackPolicy.findMany({
        where: {
          card: {
            userId,
          },
        },
        include: {
          card: true,
          category: true,
        },
        skip,
        take: pageSize,
      }),
      prisma.cashbackPolicy.count({
        where: {
          card: {
            userId,
          },
        },
      }),
    ]);
    return { policies, total, page, pageSize };
  }

  static async getPolicyById(id: string, userId: string) {
    return await prisma.cashbackPolicy.findFirst({
      where: {
        id,
        card: {
          userId,
        },
      },
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async createPolicy(
    data: {
      cardId: string;
      categoryId: string;
      cashbackPercentage: number;
      maxCashback?: number | null;
      validFrom?: Date | null;
      validTo?: Date | null;
      merchantPattern?: string | null;
    },
    userId: string,
  ) {
    if (data.validFrom && data.validTo && data.validFrom > data.validTo) {
      throw new Error("validFrom must be before or equal to validTo");
    }
    // Verify card ownership
    const card = await prisma.bankCard.findFirst({
      where: {
        id: data.cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Card not found or unauthorized");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    return await prisma.cashbackPolicy.create({
      data,
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async updatePolicy(
    id: string,
    userId: string,
    data: Partial<Omit<CashbackPolicy, "id" | "cardId" | "createdAt">> & {
      validFrom?: Date | null;
      validTo?: Date | null;
      merchantPattern?: string | null;
    },
  ) {
    if (data.validFrom && data.validTo && data.validFrom > data.validTo) {
      throw new Error("validFrom must be before or equal to validTo");
    }
    // If categoryId is being updated, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }
    }

    return await prisma.cashbackPolicy.update({
      where: {
        id,
        card: {
          userId,
        },
      },
      data,
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async deletePolicy(id: string, userId: string) {
    return await prisma.cashbackPolicy.delete({
      where: {
        id,
        card: {
          userId,
        },
      },
    });
  }

  static async calculateCashback(
    cardId: string,
    categoryId: string | null,
    amount: number,
    transactionDate: Date,
    merchantName?: string | null,
  ) {
    if (!categoryId) {
      return 0;
    }

    const policies = await prisma.cashbackPolicy.findMany({
      where: {
        cardId,
        categoryId,
      },
    });

    if (policies.length === 0) {
      return 0;
    }

    const normalizedMerchant = merchantName?.toLowerCase().trim() ?? "";

    let maxCashback = 0;
    for (const policy of policies as (CashbackPolicy & {
      validFrom?: Date | null;
      validTo?: Date | null;
      merchantPattern?: string | null;
    })[]) {
      if (policy.validFrom && transactionDate < policy.validFrom) {
        continue;
      }
      if (policy.validTo && transactionDate > policy.validTo) {
        continue;
      }

      if (policy.merchantPattern) {
        const pattern = policy.merchantPattern.toLowerCase();
        if (!normalizedMerchant || !normalizedMerchant.includes(pattern)) {
          continue;
        }
      }

      const cashback = (Math.abs(amount) * policy.cashbackPercentage) / 100;
      const finalCashback = policy.maxCashback
        ? Math.min(cashback, policy.maxCashback)
        : cashback;

      if (finalCashback > maxCashback) {
        maxCashback = finalCashback;
      }
    }

    return maxCashback;
  }

  static async getCardCashbackSummary(cardId: string, userId: string) {
    // Verify card ownership
    const card = await prisma.bankCard.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Card not found or unauthorized");
    }

    // Get all transactions with cashback for this card
    const transactions = await prisma.transaction.findMany({
      where: {
        cardId,
        cashbackEarned: {
          gt: 0,
        },
      },
      include: {
        category: true,
      },
    });

    // Calculate total cashback earned
    const totalCashback = transactions.reduce(
      (sum, t) => sum + (t.cashbackEarned ?? 0),
      0,
    );

    // Group cashback by category
    const cashbackByCategory = transactions.reduce(
      (acc, t) => {
        const categoryName = t.category?.name ?? "Uncategorized";
        acc[categoryName] = (acc[categoryName] ?? 0) + (t.cashbackEarned ?? 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalCashback,
      cashbackByCategory,
      transactions,
    };
  }

  static async getUserCashbackAnalytics(
    userId: string,
    from?: Date,
    to?: Date,
  ) {
    const where: any = {
      card: {
        userId,
      },
      cashbackEarned: {
        not: 0,
      },
    };

    if (from || to) {
      where.transactionDate = {};
      if (from) {
        where.transactionDate.gte = from;
      }
      if (to) {
        where.transactionDate.lte = to;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        card: true,
      },
      orderBy: {
        transactionDate: "asc",
      },
    });

    const perCardPerMonth: {
      cardId: string;
      cardName: string;
      bankName: string;
      month: string;
      totalCashback: number;
    }[] = [];

    const totalPerMonthMap: Record<string, number> = {};
    const perCardPerMonthMap: Record<string, number> = {};

    for (const tx of transactions) {
      const date = tx.transactionDate;
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
      const key = `${tx.cardId}-${monthKey}`;
      const cashback = tx.cashbackEarned ?? 0;

      perCardPerMonthMap[key] = (perCardPerMonthMap[key] ?? 0) + cashback;
      totalPerMonthMap[monthKey] = (totalPerMonthMap[monthKey] ?? 0) + cashback;
    }

    for (const [key, value] of Object.entries(perCardPerMonthMap)) {
      const [cardId, ...monthParts] = key.split("-");
      if (!cardId || monthParts.length === 0) {
        continue;
      }
      const month = monthParts.join("-");
      const card = transactions.find((t) => t.cardId === cardId)?.card;
      if (!card) continue;
      perCardPerMonth.push({
        cardId,
        cardName: card.cardName,
        bankName: card.bankName,
        month,
        totalCashback: value,
      });
    }

    const totalPerMonth = Object.entries(totalPerMonthMap).map(
      ([month, value]) => ({
        month,
        totalCashback: value,
      }),
    );

    const cards = Array.from(
      new Map(
        transactions.map((t) => [t.cardId, t.card]),
      ).values(),
    ).map((card) => ({
      id: card.id,
      cardName: card.cardName,
      bankName: card.bankName,
      cardColor: card.cardColor,
    }));

    return {
      perCardPerMonth,
      totalPerMonth,
      cards,
    };
  }
}
