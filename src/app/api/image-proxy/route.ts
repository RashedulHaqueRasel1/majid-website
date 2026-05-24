import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "Unsupported image URL" },
      { status: 400 },
    );
  }

  const response = await fetch(parsedUrl, {
    headers: {
      accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*",
    },
    cache: "force-cache",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Image fetch failed" },
      { status: response.status },
    );
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const body = await response.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
