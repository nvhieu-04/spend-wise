import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { suggestCategories } from "~/server/import/category-suggestion";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const merchantName = searchParams.get("merchantName") ?? "";

    if (!cardId) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 },
      );
    }

    const card = await prisma.bankCard.findFirst({
      where: {
        id: cardId,
        userId: session.user.id,
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found or unauthorized" },
        { status: 404 },
      );
    }

    const suggestions = await suggestCategories(merchantName, cardId);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get suggestions",
      },
      { status: 500 },
    );
  }
}
