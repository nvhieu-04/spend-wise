import { prisma } from "~/server/db";
import { type BankCard } from "@prisma/client";

export class BankCardService {
  static async getUserCards(userId: string) {
    return await prisma.bankCard.findMany({
      where: {
        userId,
      },
      include: {
        cashbackPolicies: true,
      },
    });
  }

  static async getCardById(id: string, userId: string) {
    return await prisma.bankCard.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        cashbackPolicies: true,
      },
    });
  }

  static async createCard(data: {
    userId: string;
    cardName: string;
    cardNumberLast4: string;
    bankName: string;
    cardType: string;
    creditLimit?: number;
  }) {
    return await prisma.bankCard.create({
      data,
      include: {
        cashbackPolicies: true,
      },
    });
  }

  static async updateCard(
    id: string,
    userId: string,
    data: Partial<Omit<BankCard, "id" | "userId" | "createdAt">>,
  ) {
    return await prisma.bankCard.update({
      where: {
        id,
        userId,
      },
      data,
      include: {
        cashbackPolicies: true,
      },
    });
  }

  static async deleteCard(id: string, userId: string) {
    return await prisma.bankCard.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
