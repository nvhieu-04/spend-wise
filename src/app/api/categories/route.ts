import { CategoryService } from "~/server/category";

export async function GET() {
  try {
    const categories = await CategoryService.getAllCategories();
    return Response.json(categories);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
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