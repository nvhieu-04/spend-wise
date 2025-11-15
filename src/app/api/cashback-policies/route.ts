import { auth } from "~/server/auth";
import { CashbackPolicyService } from "~/server/cashback";
import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

// GET all cashback policies for the current user (with pagination)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
    const result = await CashbackPolicyService.getUserPolicies(
      session.user.id,
      page,
      pageSize,
    );
    return Response.json(result);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST create a new cashback policy
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, categoryId, cashbackPercentage, maxCashback } = body;

    // Check if category already has a policy for this card
    const existingPolicy = await prisma.cashbackPolicy.findFirst({
      where: {
        cardId,
        categoryId,
      },
    });

    if (existingPolicy) {
      return NextResponse.json(
        { error: "A cashback policy already exists for this category" },
        { status: 400 },
      );
    }

    const policy = await prisma.cashbackPolicy.create({
      data: {
        cardId,
        categoryId,
        cashbackPercentage,
        maxCashback,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error("Error creating cashback policy:", error);
    return NextResponse.json(
      { error: "Failed to create cashback policy" },
      { status: 500 },
    );
  }
}
