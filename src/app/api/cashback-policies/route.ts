import { auth } from "~/server/auth";
import { CashbackPolicyService } from "~/server/cashback";
import { NextResponse } from "next/server";
import { prisma } from "~/server/db";

// GET all cashback policies for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const policies = await CashbackPolicyService.getUserPolicies(session.user.id);
    return Response.json(policies);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST create a new cashback policy
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
        { status: 400 }
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
      { status: 500 }
    );
  }
} 