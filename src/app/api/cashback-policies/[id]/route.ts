import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../../lib/prisma";

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
