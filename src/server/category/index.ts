import { prisma } from "~/server/db";
import { type Category } from "@prisma/client";

export class CategoryService {
  static async getAllCategories(cardId: string) {
    return await prisma.category.findMany({
      where: {
        cardId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async getCategoryById(id: string) {
    return await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        transactions: true,
        cashbackPolicies: true,
      },
    });
  }

  static async createCategory(data: {
    name: string;
    description?: string;
    cardId: string;
  }) {
    // Check for duplicate name within the same card
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: data.name,
        cardId: data.cardId,
      },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists for this card");
    }

    return await prisma.category.create({
      data,
    });
  }

  static async updateCategory(
    id: string,
    data: Partial<Omit<Category, "id" | "createdAt" | "cardId">>,
  ) {
    // If name is being updated, check for duplicates within the same card
    if (data.name) {
      const currentCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!currentCategory) {
        throw new Error("Category not found");
      }

      const existingCategory = await prisma.category.findFirst({
        where: {
          name: data.name,
          cardId: currentCategory.cardId,
          id: {
            not: id,
          },
        },
      });

      if (existingCategory) {
        throw new Error("Category with this name already exists for this card");
      }
    }

    return await prisma.category.update({
      where: {
        id,
      },
      data,
      include: {
        transactions: true,
        cashbackPolicies: true,
      },
    });
  }

  static async deleteCategory(id: string) {
    // Check if category is being used
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        transactions: true,
        cashbackPolicies: true,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (
      category.transactions.length > 0 ||
      category.cashbackPolicies.length > 0
    ) {
      throw new Error(
        "Cannot delete category that is being used in transactions or cashback policies",
      );
    }

    return await prisma.category.delete({
      where: {
        id,
      },
    });
  }
}
