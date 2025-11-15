import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../../lib/prisma";

// GET a specific bank card
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Gets `[id]` from the path

    if (!id) {
      return new NextResponse("Card ID is required", { status: 400 });
    }
    const card = await prisma.bankCard.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        cashbackPolicies: {
          include: {
            category: true,
          },
        },
        transactions: {
          select: {
            amount: true,
            isExpense: true,
          },
        },
      },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    const currentSpending = card.transactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);

    const currentRepayment = card.transactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const validPolicies = card.cashbackPolicies.filter(
      (policy) => policy.category !== null,
    );

    return NextResponse.json({
      ...card,
      currentSpending,
      currentRepayment,
      cashbackPolicies: validPolicies,
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT update a bank card
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Gets `[id]` from the path

    const body = await request.json();
    const { cardName, cardNumberLast4, bankName, cardType, creditLimit } = body;

    const bankCard = await prisma.bankCard.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        cardName,
        cardNumberLast4,
        bankName,
        cardType,
        creditLimit,
      },
    });

    return NextResponse.json(bankCard);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update bank card" },
      { status: 500 },
    );
  }
}

// DELETE a bank card
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Gets `[id]` from the path

    const card = await prisma.bankCard.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await prisma.bankCard.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bank card:", error);
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete bank card" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { cardColor } = data;

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Gets `[id]` from the path

    // Verify card ownership
    const card = await prisma.bankCard.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    // Update card color
    const updatedCard = await prisma.bankCard.update({
      where: {
        id: id,
      },
      data: {
        cardColor: cardColor as string,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    console.error(error); // Log the error for debugging
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
