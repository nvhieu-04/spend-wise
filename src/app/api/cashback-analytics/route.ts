import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { CashbackPolicyService } from "~/server/cashback";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;

    const analytics = await CashbackPolicyService.getUserCashbackAnalytics(
      session.user.id,
      from,
      to,
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching cashback analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch cashback analytics" },
      { status: 500 },
    );
  }
}

