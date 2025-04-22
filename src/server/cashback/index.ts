import { prisma } from "~/server/db";
import { type CashbackPolicy } from "@prisma/client";

export class CashbackPolicyService {
  static async getUserPolicies(userId: string) {
    return await prisma.cashbackPolicy.findMany({
      where: {
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

  static async createPolicy(data: {
    cardId: string;
    categoryId: string;
    cashbackPercentage: number;
    maxCashback?: number;
  }, userId: string) {
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
    data: Partial<Omit<CashbackPolicy, "id" | "cardId" | "createdAt">>,
  ) {
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

  static async calculateCashback(cardId: string, categoryId: string, amount: number) {
    // Get all cashback policies for the card and category
    const policies = await prisma.cashbackPolicy.findMany({
      where: {
        cardId,
        categoryId,
      },
    });

    if (policies.length === 0) {
      return 0;
    }

    // Calculate cashback for each policy and take the maximum
    let maxCashback = 0;
    for (const policy of policies) {
      const cashback = (amount * policy.cashbackPercentage) / 100;
      const finalCashback = policy.maxCashback 
        ? Math.min(cashback, policy.maxCashback)
        : cashback;
      
      maxCashback = Math.max(maxCashback, finalCashback);
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
    const totalCashback = transactions.reduce((sum, t) => sum + (t.cashbackEarned || 0), 0);

    // Group cashback by category
    const cashbackByCategory = transactions.reduce((acc, t) => {
      const categoryName = t.category?.name || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + (t.cashbackEarned || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCashback,
      cashbackByCategory,
      transactions,
    };
  }
} 