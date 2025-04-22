import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { CategoryService } from "~/server/category";

// GET a specific category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await CategoryService.getCategoryById(params.id);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT update a category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const category = await CategoryService.updateCategory(params.id, data);

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category with this name already exists") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message === "Category not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE a category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await CategoryService.deleteCategory(params.id);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Category not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Cannot delete category that is being used in transactions or cashback policies") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 