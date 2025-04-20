import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET a specific bank card
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bankCard = await db.bankCard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        cashbackPolicies: true,
      },
    });

    if (!bankCard) {
      return NextResponse.json({ error: "Bank card not found" }, { status: 404 });
    }

    return NextResponse.json(bankCard);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bank card" },
      { status: 500 },
    );
  }
}

// PUT update a bank card
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
    const { cardName, cardNumberLast4, bankName, cardType, creditLimit } = body;

    const bankCard = await db.bankCard.update({
      where: {
        id: params.id,
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
    return NextResponse.json(
      { error: "Failed to update bank card" },
      { status: 500 },
    );
  }
}

// DELETE a bank card
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.bankCard.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "Bank card deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete bank card" },
      { status: 500 },
    );
  }
} 