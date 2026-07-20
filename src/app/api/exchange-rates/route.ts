import { NextRequest, NextResponse } from "next/server";

const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest";

export async function GET(request: NextRequest) {
  const requestedBase = (
    request.nextUrl.searchParams.get("base") || "USD"
  ).trim();
  const base = requestedBase.toUpperCase();

  try {
    const response = await fetch(`${EXCHANGE_API_URL}/${base}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Exchange rate request failed with ${response.status}`);
    }

    const data = await response.json();
    const rates =
      data &&
      typeof data === "object" &&
      data.rates &&
      typeof data.rates === "object"
        ? (data.rates as Record<string, number>)
        : {};

    return NextResponse.json({
      success: true,
      base,
      rates: {
        [base]: 1,
        ...rates,
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      base,
      rates: {
        [base]: 1,
      },
    });
  }
}
