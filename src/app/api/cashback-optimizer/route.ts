import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { CashbackPolicyService } from "~/server/cashback";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      categoryId,
      merchantName,
    }: {
      amount: number;
      categoryId?: string | null;
      merchantName?: string | null;
    } = body;

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    const cards = await prisma.bankCard.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        cashbackPolicies: true,
      },
    });

    const today = new Date();
    const candidates: {
      card: (typeof cards)[number];
      estimatedCashback: number;
    }[] = [];

    for (const card of cards) {
      const cashback = await CashbackPolicyService.calculateCashback(
        card.id,
        categoryId ?? null,
        amount,
        today,
        merchantName ?? null,
      );

      if (cashback > 0) {
        candidates.push({
          card,
          estimatedCashback: cashback,
        });
      }
    }

    candidates.sort((a, b) => b.estimatedCashback - a.estimatedCashback);

    if (candidates.length === 0) {
      return NextResponse.json({
        bestCard: null,
        estimatedCashback: 0,
        alternatives: [],
      });
    }

    const best = candidates[0]!;

    return NextResponse.json({
      bestCard: {
        id: best.card.id,
        cardName: best.card.cardName,
        bankName: best.card.bankName,
        cardType: best.card.cardType,
        cardColor: best.card.cardColor,
      },
      estimatedCashback: best.estimatedCashback,
      alternatives: candidates.slice(1, 5).map((c) => ({
        id: c.card.id,
        cardName: c.card.cardName,
        bankName: c.card.bankName,
        cardType: c.card.cardType,
        cardColor: c.card.cardColor,
        estimatedCashback: c.estimatedCashback,
      })),
    });
  } catch (error) {
    console.error("Error in cashback optimizer:", error);
    return NextResponse.json(
      { error: "Failed to optimize cashback" },
      { status: 500 },
    );
  }
}

