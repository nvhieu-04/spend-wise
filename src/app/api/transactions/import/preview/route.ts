import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { suggestCategory } from "~/server/import/category-suggestion";
import {
  parseRow,
  type ColumnMapping,
  type ParsedRow,
} from "~/server/import/parse-row";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, rows, mapping } = body as {
      cardId: string;
      rows: string[][];
      mapping: ColumnMapping;
    };

    if (!cardId || !Array.isArray(rows) || !mapping) {
      return NextResponse.json(
        { error: "cardId, rows and mapping are required" },
        { status: 400 },
      );
    }

    const card = await prisma.bankCard.findFirst({
      where: { id: cardId, userId: session.user.id },
    });
    if (!card) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 },
      );
    }

    const errors: { rowIndex: number; message: string }[] = [];
    const resultRows: ParsedRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;

      const parsed = parseRow(row, mapping);
      if (parsed.error) {
        errors.push({ rowIndex: i, message: parsed.error });
      }

      const suggestedCategoryId = parsed.merchantName
        ? await suggestCategory(parsed.merchantName, cardId)
        : null;

      resultRows.push({
        transactionDate: parsed.transactionDate,
        amount: parsed.amount,
        merchantName: parsed.merchantName,
        suggestedCategoryId,
        isExpense: parsed.isExpense,
        ...(parsed.error && { error: parsed.error }),
      });
    }

    return NextResponse.json({
      rows: resultRows,
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    console.error("Import preview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to preview import",
      },
      { status: 500 },
    );
  }
}
