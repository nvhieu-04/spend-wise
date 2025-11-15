import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";

// GET all categories for a specific card
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 },
      );
    }

    // Verify the card belongs to the user
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

    const categories = await prisma.category.findMany({
      where: {
        cardId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
      },
      { status: 500 },
    );
  }
}

// POST create a new category for a specific card
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, cardId } = data;

    if (!name || !cardId) {
      return NextResponse.json(
        { error: "Name and card ID are required" },
        { status: 400 },
      );
    }

    // Verify the card belongs to the user
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

    // Check if category with same name already exists for this card
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        cardId,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists for this card" },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        cardId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create category",
      },
      { status: 500 },
    );
  }
}
