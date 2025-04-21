import { prisma } from "~/server/db";
import { type Category } from "@prisma/client";

export class CategoryService {
  static async getAllCategories() {
    return await prisma.category.findMany({
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
  }) {
    // Check for duplicate name
    const existingCategory = await prisma.category.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }

    return await prisma.category.create({
      data,
    });
  }

  static async updateCategory(
    id: string,
    data: Partial<Omit<Category, "id" | "createdAt">>,
  ) {
    // If name is being updated, check for duplicates
    if (data.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: data.name,
          id: {
            not: id,
          },
        },
      });

      if (existingCategory) {
        throw new Error("Category with this name already exists");
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

    if (category.transactions.length > 0 || category.cashbackPolicies.length > 0) {
      throw new Error("Cannot delete category that is being used in transactions or cashback policies");
    }

    return await prisma.category.delete({
      where: {
        id,
      },
    });
  }
} 