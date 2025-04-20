import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET a specific transaction
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        card: {
          userId: session.user.id,
        },
      },
      include: {
        card: true,
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}

// PUT update a transaction
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
    const {
      amount,
      currency,
      transactionDate,
      merchantName,
      categoryId,
      cashbackEarned,
    } = body;

    const transaction = await db.transaction.update({
      where: {
        id: params.id,
        card: {
          userId: session.user.id,
        },
      },
      data: {
        amount,
        currency,
        transactionDate: transactionDate ? new Date(transactionDate) : undefined,
        merchantName,
        categoryId,
        cashbackEarned,
      },
      include: {
        card: true,
        category: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}

// DELETE a transaction
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.transaction.delete({
      where: {
        id: params.id,
        card: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
} 