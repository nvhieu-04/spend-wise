import { NextRequest } from "next/server";

const LOGO_PUBLIC_KEY =
  process.env.LOGO_DEV_PUBLIC_KEY || "pk_WMoeQCNFRxmS-gcweeB5SQ";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) return new Response("Missing name", { status: 400 });

  const upstream = `https://img.logo.dev/name/${encodeURIComponent(
    name,
  )}?token=${LOGO_PUBLIC_KEY}`;

  try {
    const res = await fetch(upstream, {
      // Cache the logo for 24h on the edge/node cache
      cache: "force-cache",
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return new Response("Upstream error", { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/png";
    const body = await res.arrayBuffer();

    return new Response(body, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400, immutable",
      },
    });
  } catch (e) {
    return new Response("Failed to fetch logo", { status: 502 });
  }
}
