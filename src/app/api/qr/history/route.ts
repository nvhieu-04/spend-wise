import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { qrHistory } from "~/server/db";

const HISTORY_LIMIT = 20;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await qrHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch history",
      },
      { status: 500 },
    );
  }
}
