import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.qrTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch templates",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, acqId, accountNo, accountName, addInfo } = body;

    if (!name?.trim() || !acqId || !accountNo?.trim() || !accountName?.trim()) {
      return NextResponse.json(
        { error: "name, acqId, accountNo and accountName are required" },
        { status: 400 },
      );
    }

    const template = await prisma.qrTemplate.create({
      data: {
        userId: session.user.id,
        name: String(name).trim(),
        acqId: String(acqId),
        accountNo: String(accountNo).trim(),
        accountName: String(accountName).trim(),
        addInfo: addInfo != null ? String(addInfo).trim() || null : null,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create template",
      },
      { status: 500 },
    );
  }
}
