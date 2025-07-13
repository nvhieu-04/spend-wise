import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { StatisticsService } from "~/server/transaction/statistics";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const overview = await StatisticsService.getOverview(session.user.id);
    return NextResponse.json(overview);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
