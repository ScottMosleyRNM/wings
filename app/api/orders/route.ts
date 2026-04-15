import { NextResponse } from "next/server";
import { createSession } from "@/lib/kv";
import { generateCode } from "@/lib/utils";

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Order name is required" }, { status: 400 });
  }

  const code = generateCode();
  const session = await createSession(name.trim(), code);

  return NextResponse.json({ session }, { status: 201 });
}
