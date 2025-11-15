import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";

// GET a specific transaction
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = url.pathname.split("/").pop(); // Gets `[id]` from the path
    if (!params) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }
    const id = params.split("/").pop() ?? "";

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
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
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = url.pathname.split("/").pop(); // Gets `[id]` from the path
    if (!params) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }
    const id = params.split("/").pop() ?? "";

    const body = await request.json();
    const {
      amount,
      currency,
      transactionDate,
      merchantName,
      categoryId,
      cashbackEarned,
    } = body;

    const transaction = await prisma.transaction.update({
      where: {
        id: id,
        card: {
          userId: session.user.id,
        },
      },
      data: {
        amount,
        currency,
        transactionDate: transactionDate
          ? new Date(transactionDate)
          : undefined,
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
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = url.pathname.split("/").pop(); // Gets `[id]` from the path
    if (!params) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }
    const id = params.split("/").pop() ?? "";

    await prisma.transaction.delete({
      where: {
        id: id,
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
