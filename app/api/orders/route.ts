import { NextResponse } from "next/server";
import { createSession } from "@/lib/kv";
import { generateCode } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Order name is required" }, { status: 400 });
    }

    const code = generateCode();
    const session = await createSession(name.trim(), code);

    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("POST /api/orders error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
