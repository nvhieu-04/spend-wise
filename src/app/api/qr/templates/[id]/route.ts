import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.qrTemplate.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found or unauthorized" },
        { status: 404 },
      );
    }

    await prisma.qrTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete template",
      },
      { status: 500 },
    );
  }
}
