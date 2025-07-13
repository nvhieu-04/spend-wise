import { prisma } from "~/server/db";
import { type Transaction } from "@prisma/client";
import { CashbackPolicyService } from "../cashback";

export class TransactionService {
  static async getUserTransactions(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          card: {
            userId,
          },
        },
        include: {
          card: true,
          category: true,
        },
        orderBy: {
          transactionDate: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({
        where: {
          card: {
            userId,
          },
        },
      }),
    ]);
    return { transactions, total, page, pageSize };
  }

  static async getTransactionById(id: string, userId: string) {
    return await prisma.transaction.findFirst({
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

  static async createTransaction(
    data: {
      cardId: string;
      amount: number;
      currency: string;
      transactionDate: Date;
      merchantName?: string;
      categoryId?: string;
      cashbackEarned?: number;
    },
    userId: string
  ) {
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

    // Calculate cashback if category is provided
    let cashbackEarned = 0;
    if (data.categoryId) {
      cashbackEarned = await CashbackPolicyService.calculateCashback(
        data.cardId,
        data.categoryId,
        data.amount
      );
    }

    return await prisma.transaction.create({
      data: {
        ...data,
        cashbackEarned,
      },
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async updateTransaction(
    id: string,
    userId: string,
    data: Partial<Omit<Transaction, "id" | "cardId" | "createdAt">>
  ) {
    return await prisma.transaction.update({
      where: {
        id,
        card: {
          userId,
        },
      },
      data: {
        ...data,
        transactionDate: data.transactionDate
          ? new Date(data.transactionDate)
          : undefined,
      },
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async deleteTransaction(id: string, userId: string) {
    return await prisma.transaction.delete({
      where: {
        id,
        card: {
          userId,
        },
      },
    });
  }
}