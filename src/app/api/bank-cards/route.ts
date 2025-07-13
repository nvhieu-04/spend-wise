import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "~/server/auth";

// GET all bank cards for the current user (with pagination)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
    const skip = (page - 1) * pageSize;
    const [cards, total] = await Promise.all([
      prisma.bankCard.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          cardName: true,
          bankName: true,
          cardType: true,
          cardNumberLast4: true,
          creditLimit: true,
          cardColor: true,
        },
        skip,
        take: pageSize,
      }),
      prisma.bankCard.count({
        where: {
          userId: session.user.id,
        },
      })
    ]);
    return NextResponse.json({ cards, total, page, pageSize });
  } catch (error) {
    console.error("Error fetching bank cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank cards" },
      { status: 500 }
    );
  }
}

// POST create a new bank card
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      cardName, 
      bankName, 
      cardType, 
      cardNumberLast4, 
      creditLimit,
      statementClosingDate,
      paymentDueDate,
      cardColor 
    } = body;

    // Validate required fields
    if (!cardName || !bankName || !cardType || !cardNumberLast4) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate card number format
    if (!/^\d{4}$/.test(cardNumberLast4)) {
      return NextResponse.json(
        { error: "Invalid card number format" },
        { status: 400 }
      );
    }

    // Validate card color format if provided
    if (cardColor && !/^#[0-9A-Fa-f]{6}$/.test(cardColor)) {
      return NextResponse.json(
        { error: "Invalid card color format" },
        { status: 400 }
      );
    }

    // Parse and validate statement closing date and payment due date
    const parsedStatementClosingDate = statementClosingDate ? parseInt(statementClosingDate, 10) : undefined;
    const parsedPaymentDueDate = paymentDueDate ? parseInt(paymentDueDate, 10) : undefined;

    if (parsedStatementClosingDate && (parsedStatementClosingDate < 1 || parsedStatementClosingDate > 31)) {
      return NextResponse.json(
        { error: "Statement closing date must be between 1 and 31" },
        { status: 400 }
      );
    }

    if (parsedPaymentDueDate && (parsedPaymentDueDate < 1 || parsedPaymentDueDate > 31)) {
      return NextResponse.json(
        { error: "Payment due date must be between 1 and 31" },
        { status: 400 }
      );
    }

    const newCard = await prisma.bankCard.create({
      data: {
        cardName,
        bankName,
        cardType,
        cardNumberLast4,
        creditLimit,
        statementClosingDate: parsedStatementClosingDate,
        paymentDueDate: parsedPaymentDueDate,
        cardColor: cardColor ?? null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Error creating bank card:", error);
    return NextResponse.json(
      { error: "Failed to create bank card" },
      { status: 500 }
    );
  }
}