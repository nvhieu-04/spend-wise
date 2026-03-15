import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "~/server/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const [bankNameRows, cardTypeRows] = await Promise.all([
      prisma.bankCard.findMany({
        where: { userId },
        select: { bankName: true },
        distinct: ["bankName"],
        orderBy: { bankName: "asc" },
      }),
      prisma.bankCard.findMany({
        where: { userId },
        select: { cardType: true },
        distinct: ["cardType"],
        orderBy: { cardType: "asc" },
      }),
    ]);

    const bankNames = bankNameRows.map((r) => r.bankName);
    const cardTypes = cardTypeRows.map((r) => r.cardType);

    return NextResponse.json({ bankNames, cardTypes });
  } catch (error) {
    console.error("Error fetching bank card filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 },
    );
  }
}
