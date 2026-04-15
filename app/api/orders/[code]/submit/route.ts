import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/kv";
import { normalizeKey } from "@/lib/utils";
import type { WingSelection } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const session = await getSession(code);

  if (!session) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, selections } = body as { name: string; selections: WingSelection[] };

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: "At least one wing selection is required" }, { status: 400 });
  }

  for (const s of selections) {
    if (!s.flavorId || !["classic", "boneless"].includes(s.style)) {
      return NextResponse.json({ error: "Invalid selection format" }, { status: 400 });
    }
    if (typeof s.quantity !== "number" || s.quantity < 1 || s.quantity > 100) {
      return NextResponse.json({ error: "Quantity must be between 1 and 100" }, { status: 400 });
    }
  }

  const key = normalizeKey(name.trim());
  session.orders[key] = { name: name.trim(), selections, submittedAt: new Date().toISOString() };
  await saveSession(session);

  return NextResponse.json({ order: session.orders[key] });
}
