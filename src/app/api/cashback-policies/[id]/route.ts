import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const policy = await prisma.cashbackPolicy.findFirst({
      where: {
        id: params.id,
        card: {
          userId: session.user.id,
        },
      },
    });

    if (!policy) {
      return NextResponse.json(
        { error: "Policy not found" },
        { status: 404 }
      );
    }

    await prisma.cashbackPolicy.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cashback policy:", error);
    return NextResponse.json(
      { error: "Failed to delete cashback policy" },
      { status: 500 }
    );
  }
} 