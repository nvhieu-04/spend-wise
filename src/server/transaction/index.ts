import { db } from "~/server/db";
import { type Transaction } from "@prisma/client";

export class TransactionService {
  static async getUserTransactions(userId: string) {
    return await db.transaction.findMany({
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
    });
  }

  static async getTransactionById(id: string, userId: string) {
    return await db.transaction.findFirst({
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

  static async createTransaction(data: {
    cardId: string;
    amount: number;
    currency: string;
    transactionDate: Date;
    merchantName?: string;
    categoryId?: string;
    cashbackEarned?: number;
  }, userId: string) {
    // Verify card ownership
    const card = await db.bankCard.findFirst({
      where: {
        id: data.cardId,
        userId,
      },
    });

    if (!card) {
      throw new Error("Card not found or unauthorized");
    }

    return await db.transaction.create({
      data,
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async updateTransaction(
    id: string,
    userId: string,
    data: Partial<Omit<Transaction, "id" | "cardId" | "createdAt">>,
  ) {
    return await db.transaction.update({
      where: {
        id,
        card: {
          userId,
        },
      },
      data: {
        ...data,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined,
      },
      include: {
        card: true,
        category: true,
      },
    });
  }

  static async deleteTransaction(id: string, userId: string) {
    return await db.transaction.delete({
      where: {
        id,
        card: {
          userId,
        },
      },
    });
  }
} 