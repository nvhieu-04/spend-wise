import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statementDate = searchParams.get("statementDate");
    const filterType = searchParams.get("filterType");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (filterType === "statement" && statementDate) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const statementDay = parseInt(statementDate, 10);

      // Calculate the statement period
      if (currentDate.getDate() < statementDay) {
        // If current date is before statement date, show from last month's statement date to today
        startDate = new Date(currentYear, currentMonth - 1, statementDay);
        endDate = currentDate;
      } else {
        // If current date is after statement date, show from this month's statement date to today
        startDate = new Date(currentYear, currentMonth, statementDay);
        endDate = currentDate;
      }

      // Ensure we don't filter out any transactions
      if (startDate && endDate) {
        console.log(
          `Statement period: ${startDate.toISOString()} to ${endDate.toISOString()}`,
        );
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        cardId: id ?? undefined,
        card: {
          userId: session.user.id,
        },
        ...(startDate &&
          endDate && {
            transactionDate: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        card: {
          include: {
            cashbackPolicies: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    // Calculate cashback for each transaction
    const transactionsWithCashback = transactions.map((transaction) => {
      if (!transaction.categoryId) {
        return {
          ...transaction,
          cashbackEarned: 0,
        };
      }

      const policy = transaction.card.cashbackPolicies.find(
        (p) => p.categoryId === transaction.categoryId,
      );

      if (!policy) {
        return {
          ...transaction,
          cashbackEarned: 0,
        };
      }

      const cashbackAmount =
        (Math.abs(transaction.amount) * policy.cashbackPercentage) / 100;
      const finalCashback = policy.maxCashback
        ? Math.min(cashbackAmount, policy.maxCashback)
        : cashbackAmount;

      return {
        ...transaction,
        cashbackEarned: transaction.isExpense ? finalCashback : -finalCashback,
      };
    });

    // Calculate total cashback
    const totalCashback = transactionsWithCashback.reduce(
      (sum, transaction) => sum + (transaction.cashbackEarned || 0),
      0,
    );

    return NextResponse.json({
      transactions: transactionsWithCashback,
      totalCashback,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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
      cardId,
    } = body;

    // Validate required fields
    if (!amount || !currency || !transactionDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate amount is a number
    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate amount is not zero
    if (amount === 0) {
      return NextResponse.json(
        { error: "Amount cannot be zero" },
        { status: 400 },
      );
    }

    // Check if the card belongs to the user
    const card = await prisma.bankCard.findFirst({
      where: {
        id: cardId ?? undefined,
        userId: session.user.id,
      },
      include: {
        cashbackPolicies: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // If categoryId is provided, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 },
        );
      }
    }

    // Calculate cashback if it's an expense and has a category
    let cashbackEarned = 0;
    if (categoryId) {
      const policy = card.cashbackPolicies.find(
        (p) => p.categoryId === categoryId,
      );
      if (policy) {
        const cashbackAmount =
          (Math.abs(amount) * policy.cashbackPercentage) / 100;
        const finalCashback = policy.maxCashback
          ? Math.min(cashbackAmount, policy.maxCashback)
          : cashbackAmount;
        cashbackEarned = amount < 0 ? finalCashback : -finalCashback;
      }
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount, // Store original amount (negative for expenses, positive for refunds)
        currency,
        transactionDate: new Date(transactionDate),
        merchantName,
        categoryId:
          typeof categoryId === "string" && categoryId.trim() !== ""
            ? categoryId
            : null, // Ensure null if categoryId is empty or not provided
        cardId: cardId ?? undefined,
        isExpense: amount < 0, // true for expenses (negative), false for refunds (positive)
        cashbackEarned,
      } as any,
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
      { status: 500 },
    );
  }
}
