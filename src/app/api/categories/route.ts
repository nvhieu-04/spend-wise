import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const category = await CategoryService.createCategory(data);

    return Response.json(category);
  } catch (error) {
    if (error instanceof Error && error.message === "Category with this name already exists") {
      return new Response("Category with this name already exists", { status: 400 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
} 