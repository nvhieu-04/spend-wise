import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        cardId: params.id,
        card: {
          userId: session.user.id,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency, transactionDate, merchantName, categoryId, type } = body;

    // Validate required fields
    if (!amount || !currency || !transactionDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount is a number
    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate amount is not zero
    if (amount === 0) {
      return NextResponse.json(
        { error: "Amount cannot be zero" },
        { status: 400 }
      );
    }

    // Check if the card belongs to the user
    const card = await prisma.bankCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    // If categoryId is provided, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: Math.abs(amount), // Store absolute value
        currency,
        transactionDate: new Date(transactionDate),
        merchantName,
        categoryId: categoryId || null,
        cardId: params.id,
        isExpense: amount < 0, // true for expenses (negative), false for refunds (positive)
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
} 