import { prisma } from "~/server/db";

export class UserService {
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        bankCards: {
          select: {
            id: true,
            cardName: true,
            cardNumberLast4: true,
            bankName: true,
            cardType: true,
            creditLimit: true,
            createdAt: true,
          },
        },
      },
    });
  }

  static async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      image?: string;
    },
  ) {
    return await prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }
}
