import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { CashbackPolicyService } from "~/server/cashback";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await CashbackPolicyService.getCardCashbackSummary(
      params.id,
      session.user.id
    );

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Card not found or unauthorized") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch cashback summary" },
      { status: 500 }
    );
  }
} 