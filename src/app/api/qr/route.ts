import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { qrHistory } from "~/server/db";

const VIETQR_CLIENT_ID = process.env.VIETQR_CLIENT_ID;
const VIETQR_API_KEY = process.env.VIETQR_API_KEY;

export async function POST(request: Request) {
  try {
    if (!VIETQR_CLIENT_ID || !VIETQR_API_KEY) {
      return NextResponse.json(
        { error: "VietQR credentials are not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const {
      accountNo,
      accountName,
      acqId,
      amount,
      addInfo,
      template = "compact",
      format = "text",
    } = body;

    if (!accountNo || !accountName || !acqId) {
      return NextResponse.json(
        { error: "accountNo, accountName and acqId are required" },
        { status: 400 },
      );
    }

    const upstreamResponse = await fetch("https://api.vietqr.io/v2/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": VIETQR_CLIENT_ID,
        "x-api-key": VIETQR_API_KEY,
      },
      body: JSON.stringify({
        accountNo,
        accountName,
        acqId,
        amount,
        addInfo,
        template,
        format,
      }),
    });

    const data = await upstreamResponse.json();

    if (!upstreamResponse.ok || data.code !== "00") {
      return NextResponse.json(
        {
          error: data?.desc || "Failed to generate VietQR",
          details: data,
        },
        { status: upstreamResponse.status || 502 },
      );
    }

    const session = await auth();
    if (session?.user?.id) {
      await qrHistory.create({
        data: {
          userId: session.user.id,
          acqId: String(acqId),
          accountNo,
          accountName,
          amount: amount != null ? Number(amount) : null,
          addInfo: addInfo ?? null,
        },
      });
    }

    return NextResponse.json(
      {
        qrCode: data.data?.qrCode,
        qrDataURL: data.data?.qrDataURL,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating VietQR:", error);
    return NextResponse.json(
      { error: "Failed to generate VietQR" },
      { status: 500 },
    );
  }
}

