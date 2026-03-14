import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../../lib/prisma";
import { CashbackPolicyService } from "~/server/cashback";

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const policy = await prisma.cashbackPolicy.findFirst({
      where: {
        id: id,
        card: {
          userId: session.user.id,
        },
      },
    });

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    await prisma.cashbackPolicy.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cashback policy:", error);
    return NextResponse.json(
      { error: "Failed to delete cashback policy" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop() ?? "";
    const body = await request.json();

    const { cashbackPercentage, maxCashback, categoryId, validFrom, validTo, merchantPattern } =
      body;

    const data: any = {};
    if (typeof cashbackPercentage === "number") {
      data.cashbackPercentage = cashbackPercentage;
    }
    if (typeof maxCashback === "number" || maxCashback === null) {
      data.maxCashback = maxCashback;
    }
    if (typeof categoryId === "string") {
      data.categoryId = categoryId;
    }
    if (validFrom !== undefined) {
      data.validFrom = validFrom ? new Date(validFrom) : null;
    }
    if (validTo !== undefined) {
      data.validTo = validTo ? new Date(validTo) : null;
    }
    if (merchantPattern !== undefined) {
      data.merchantPattern =
        typeof merchantPattern === "string" && merchantPattern.trim() !== ""
          ? merchantPattern
          : null;
    }

    const updated = await CashbackPolicyService.updatePolicy(
      id,
      session.user.id,
      data,
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating cashback policy:", error);
    return NextResponse.json(
      { error: "Failed to update cashback policy" },
      { status: 500 },
    );
  }
}

