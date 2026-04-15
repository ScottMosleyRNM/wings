import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/kv";
import { normalizeKey } from "@/lib/utils";
import type { WingOrder, SideOrder } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const session = await getSession(code);
    if (!session) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const body = await req.json();
    const { name, wings, sides, dips } = body as {
      name: string;
      wings: WingOrder[];
      sides: SideOrder[];
      dips: string[];
    };

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!Array.isArray(wings) || wings.length === 0) return NextResponse.json({ error: "At least one wing order is required" }, { status: 400 });

    for (const w of wings) {
      if (!w.flavorId || !["classic", "boneless"].includes(w.style))
        return NextResponse.json({ error: "Invalid wing selection" }, { status: 400 });
      if (typeof w.quantity !== "number" || w.quantity < 1 || w.quantity > 200)
        return NextResponse.json({ error: "Wing quantity must be between 1 and 200" }, { status: 400 });
    }

    const key = normalizeKey(name.trim());
    session.orders[key] = {
      name: name.trim(),
      wings,
      sides: Array.isArray(sides) ? sides : [],
      dips: Array.isArray(dips) ? dips : [],
      submittedAt: new Date().toISOString(),
    };
    await saveSession(session);
    return NextResponse.json({ order: session.orders[key] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("POST submit error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
