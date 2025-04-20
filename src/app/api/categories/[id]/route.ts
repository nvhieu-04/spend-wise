import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET a specific category
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await db.category.findUnique({
      where: {
        id: params.id,
      },
      include: {
        transactions: true,
        cashbackPolicies: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// PUT update a category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // If name is being updated, check if it already exists
    if (name) {
      const existingCategory = await db.category.findFirst({
        where: {
          name,
          id: {
            not: params.id,
          },
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: "Category with this name already exists" },
          { status: 409 },
        );
      }
    }

    const category = await db.category.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
      },
      include: {
        transactions: true,
        cashbackPolicies: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE a category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if category is being used in transactions or cashback policies
    const category = await db.category.findUnique({
      where: {
        id: params.id,
      },
      include: {
        transactions: true,
        cashbackPolicies: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category.transactions.length > 0 || category.cashbackPolicies.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category that is being used in transactions or cashback policies",
        },
        { status: 400 },
      );
    }

    await db.category.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
} 