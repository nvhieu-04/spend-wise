import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { TransactionService } from "~/server/transaction";

const DEFAULT_CURRENCY = "VNĐ";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      cardId,
      transactions,
    }: {
      cardId: string;
      transactions: {
        transactionDate: string;
        amount: number;
        merchantName?: string;
        categoryId?: string | null;
      }[];
    } = body;

    if (!cardId || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "cardId and transactions array are required" },
        { status: 400 },
      );
    }

    const created: number[] = [];
    const failed: { index: number; error: string }[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (!t) {
        failed.push({ index: i, error: "Missing row" });
        continue;
      }
      const date = t.transactionDate ? new Date(t.transactionDate) : null;
      if (!date || isNaN(date.getTime())) {
        failed.push({ index: i, error: "Invalid date" });
        continue;
      }
      if (typeof t.amount !== "number" || t.amount === 0) {
        failed.push({ index: i, error: "Invalid amount" });
        continue;
      }

      try {
        await TransactionService.createTransaction(
          {
            cardId,
            amount: t.amount,
            currency: DEFAULT_CURRENCY,
            transactionDate: date,
            merchantName: t.merchantName ?? undefined,
            categoryId:
              t.categoryId && String(t.categoryId).trim() ? t.categoryId : undefined,
          },
          session.user.id,
        );
        created.push(i);
      } catch (err) {
        failed.push({
          index: i,
          error: err instanceof Error ? err.message : "Create failed",
        });
      }
    }

    return NextResponse.json({
      created: created.length,
      failed: failed.length > 0 ? failed : undefined,
    });
  } catch (error) {
    console.error("Import transactions error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to import transactions",
      },
      { status: 500 },
    );
  }
}
