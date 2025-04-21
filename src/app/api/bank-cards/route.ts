import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "~/server/auth";
import { authConfig } from "~/server/auth/config";

// GET all bank cards for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const cards = await prisma.bankCard.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(cards);
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
      paymentDueDate 
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

    // Validate statement closing date and payment due date
    if (statementClosingDate && (statementClosingDate < 1 || statementClosingDate > 31)) {
      return NextResponse.json(
        { error: "Statement closing date must be between 1 and 31" },
        { status: 400 }
      );
    }

    if (paymentDueDate && (paymentDueDate < 1 || paymentDueDate > 31)) {
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
        statementClosingDate,
        paymentDueDate,
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