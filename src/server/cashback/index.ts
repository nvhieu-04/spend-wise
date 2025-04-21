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
} 