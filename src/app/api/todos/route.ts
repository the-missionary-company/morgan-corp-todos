import { NextResponse } from "next/server";
import { getTodos } from "@/lib/smartsheet";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getTodos();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load todos";
    return NextResponse.json(
      {
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        todos: [],
        error: message,
      },
      { status: 500 }
    );
  }
}
