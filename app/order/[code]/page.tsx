"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { FLAVORS, HEAT_LABELS, HEAT_COLORS, HEAT_BG, WING_QUICK_PICKS, SIDES, SIDE_QTY, DIPS, DIP_QTY } from "@/lib/menu";
import type { OrderSession, WingOrder, SideOrder, DipOrder } from "@/lib/types";
import { normalizeKey } from "@/lib/utils";

export default function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);

  const [session, setSession] = useState<OrderSession | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [participantName, setParticipantName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wings, setWings] = useState<WingOrder[]>([{ flavorId: "", quantity: 10, style: "classic" }]);
  const [sides, setSides] = useState<SideOrder[]>([]);
  const [dips, setDips] = useState<DipOrder[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${code}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setSession(d.session); })
      .finally(() => setLoadingSession(false));
  }, [code]);

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participantName.trim() || !session) return;
    const existing = session.orders[normalizeKey(participantName.trim())];
    if (existing) {
      setIsEditing(true);
      if (existing.wings?.length) setWings(existing.wings.map((w: WingOrder) => ({ ...w })));
      if (existing.sides?.length) setSides(existing.sides.map((s: SideOrder) => ({ ...s })));
      if (existing.dips?.length) setDips(existing.dips.map((d: DipOrder) => ({ ...d })));
    }
    setNameSubmitted(true);
  }

  function addWingRow() { setWings(p => [...p, { flavorId: "", quantity: 10, style: "classic" }]); }
  function removeWingRow(i: number) { setWings(p => p.filter((_, idx) => idx !== i)); }
  function updateWing(i: number, field: keyof WingOrder, val: string | number) {
    setWings(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }
  function setWingQty(i: number, raw: string) {
    const n = parseInt(raw);
    updateWing(i, "quantity", isNaN(n) || n < 1 ? 1 : Math.min(n, 500));
  }

  function toggleSide(sideId: string) {
    setSides(p => p.find(s => s.sideId === sideId) ? p.filter(s => s.sideId !== sideId) : [...p, { sideId, quantity: 1 }]);
  }
  function setSideQty(sideId: string, quantity: number) {
    setSides(p => p.map(s => s.sideId === sideId ? { ...s, quantity } : s));
  }

  function toggleDip(dipId: string) {
    setDips(p => p.find(d => d.dipId === dipId) ? p.filter(d => d.dipId !== dipId) : [...p, { dipId, quantity: 1 }]);
  }
  function setDipQty(dipId: string, quantity: number) {
    setDips(p => p.map(d => d.dipId === dipId ? { ...d, quantity } : d));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (wings.some(w => !w.flavorId)) { setSubmitError("Please select a flavor for each wing row."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: participantName.trim(), wings, sides, dips }),
      });
      if (!res.ok) { const d = await res.json(); setSubmitError(d.error || "Failed to submit."); return; }
      setSubmitted(true);
    } catch { setSubmitError("Something went wrong. Try again."); }
    finally { setSubmitting(false); }
  }

  function reset() {
    setSubmitted(false); setNameSubmitted(false); setParticipantName("");
    setWings([{ flavorId: "", quantity: 10, style: "classic" }]);
    setSides([]); setDips([]); setIsEditing(false);
  }

  const totalWings = wings.reduce((s, w) => s + w.quantity, 0);
  const card = { background: "var(--card)", border: "1px solid var(--border)" };
  const muted = { color: "var(--muted-foreground)" };

  if (loadingSession) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <p style={muted}>Loading…</p>
    </main>
  );

  if (notFound || !session) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-5xl mb-4">🤔</div>
      <h1 className="text-xl font-bold mb-2">Order not found</h1>
      <Link href="/" style={{ color: "var(--green)" }}>← Back to home</Link>
    </main>
  );

  if (submitted) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-6xl mb-4">🍗</div>
      <h1 className="text-2xl font-extrabold mb-2">Order submitted!</h1>
      <p className="text-sm mb-1" style={muted}>
        {totalWings} wings{sides.length ? ` · ${sides.length} side${sides.length > 1 ? "s" : ""}` : ""}{dips.length ? ` · ${dips.length} dip${dips.length > 1 ? "s" : ""}` : ""} for <strong>{participantName}</strong>
      </p>
      <p className="text-sm mb-8" style={muted}>
        Use code <span className="font-mono font-bold" style={{ color: "var(--green)" }}>{code}</span> to edit your order.
      </p>
      <button onClick={reset} className="text-sm rounded-lg px-5 py-2.5 font-semibold"
        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
        Submit another order
      </button>
    </main>
  );

  if (!nameSubmitted) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm mb-6"><Link href="/" style={muted}>← Back</Link></div>
      <div className="w-full max-w-sm">
        <p className="text-xs font-mono mb-1" style={{ color: "var(--green)" }}>{session.name}</p>
        <h1 className="text-2xl font-extrabold mb-1">What’s your name?</h1>
        <p className="text-sm mb-8" style={muted}>Use the same name to come back and edit your order.</p>
        <div className="rounded-2xl p-6" style={card}>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input type="text" placeholder="Your name" value={participantName}
              onChange={e => setParticipantName(e.target.value)} maxLength={40} autoFocus
              className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }} />
            <button type="submit" disabled={!participantName.trim()}
              className="w-full rounded-lg py-3 text-sm font-bold disabled:opacity-40 cursor-pointer"
              style={{ background: "var(--green)", color: "#000" }}>Continue →</button>
          </form>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <p className="text-xs font-mono mb-1" style={{ color: "var(--green)" }}>{session.name}</p>
          <h1 className="text-2xl font-extrabold">{isEditing ? "Edit your order" : "Build your order"}</h1>
          <p className="text-sm mt-1" style={muted}>Ordering for <strong style={{ color: "var(--yellow)" }}>{participantName}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* WINGS */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍗</span>
              <h2 className="text-base font-bold">Wings</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "var(--muted)", color: "var(--green)" }}>{totalWings} total</span>
            </div>
            <div className="space-y-3">
              {wings.map((row, i) => {
                const flavor = FLAVORS.find(f => f.id === row.flavorId);
                return (
                  <div key={i} className="rounded-2xl p-4 space-y-3"
                    style={{ background: HEAT_BG[flavor?.heat ?? 0], border: `1px solid ${HEAT_COLORS[flavor?.heat ?? 0]}44` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={muted}>Item {i + 1}</span>
                      {wings.length > 1 && (
                        <button type="button" onClick={() => removeWingRow(i)}
                          className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--muted)", ...muted }}>Remove</button>
                      )}
                    </div>

                    {/* Flavor */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={muted}>Flavor</label>
                      <select value={row.flavorId} onChange={e => updateWing(i, "flavorId", e.target.value)}
                        className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                        style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                        <option value="">Select a flavor…</option>
                        {FLAVORS.map(f => <option key={f.id} value={f.id}>{f.name} — {HEAT_LABELS[f.heat]}</option>)}
                      </select>
                      {flavor && <p className="text-xs mt-1" style={{ color: HEAT_COLORS[flavor.heat] }}>{flavor.description}</p>}
                    </div>

                    {/* Style */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={muted}>Style</label>
                      <div className="flex gap-2">
                        {(["classic", "boneless"] as const).map(s => (
                          <button key={s} type="button" onClick={() => updateWing(i, "style", s)}
                            className="flex-1 rounded-lg py-2 text-sm font-semibold capitalize"
                            style={{ background: row.style === s ? "var(--green)" : "var(--muted)", color: row.style === s ? "#000" : "var(--foreground)", border: "1px solid transparent" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={muted}>Quantity</label>
                      {/* Quick picks */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {WING_QUICK_PICKS.map(n => (
                          <button key={n} type="button" onClick={() => updateWing(i, "quantity", n)}
                            className="rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                            style={{ background: row.quantity === n ? "var(--yellow)" : "var(--muted)", color: row.quantity === n ? "#000" : "var(--muted-foreground)", border: "1px solid transparent" }}>
                            {n}
                          </button>
                        ))}
                      </div>
                      {/* Stepper */}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateWing(i, "quantity", Math.max(1, row.quantity - 1))}
                          className="w-10 h-10 rounded-lg text-lg font-bold flex items-center justify-center"
                          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>−</button>
                        <input
                          type="number" min={1} max={500}
                          value={row.quantity}
                          onChange={e => setWingQty(i, e.target.value)}
                          className="flex-1 rounded-lg px-3 py-2 text-center text-lg font-black font-mono focus:outline-none"
                          style={{ background: "var(--muted)", color: "var(--yellow)", border: "1px solid var(--border)" }}
                        />
                        <button type="button" onClick={() => updateWing(i, "quantity", Math.min(500, row.quantity + 1))}
                          className="w-10 h-10 rounded-lg text-lg font-bold flex items-center justify-center"
                          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={addWingRow} className="w-full mt-3 rounded-xl py-2.5 text-sm font-medium"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px dashed var(--border)" }}>
              + Add another flavor
            </button>
          </section>

          {/* SIDES */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍟</span>
              <h2 className="text-base font-bold">Sides</h2>
              <span className="text-xs" style={muted}>optional</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SIDES.map(side => {
                const sel = sides.find(s => s.sideId === side.id);
                return (
                  <div key={side.id} onClick={() => toggleSide(side.id)}
                    className="rounded-xl p-3 cursor-pointer"
                    style={{ background: sel ? "#0d2200" : "var(--card)", border: `1px solid ${sel ? "var(--green)" : "var(--border)"}` }}>
                    <div className="text-2xl mb-1">{side.emoji}</div>
                    <div className="text-xs font-semibold">{side.name}</div>
                    <div className="text-xs mt-0.5" style={muted}>{side.description}</div>
                    {sel && (
                      <div className="mt-2 flex gap-1" onClick={e => e.stopPropagation()}>
                        {SIDE_QTY.map(n => (
                          <button key={n} type="button" onClick={() => setSideQty(side.id, n)}
                            className="flex-1 rounded py-1 text-xs font-bold"
                            style={{ background: sel.quantity === n ? "var(--green)" : "var(--muted)", color: sel.quantity === n ? "#000" : "var(--foreground)" }}>
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* DIPS */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥣</span>
              <h2 className="text-base font-bold">Dipping Sauces</h2>
              <span className="text-xs" style={muted}>optional</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DIPS.map(dip => {
                const sel = dips.find(d => d.dipId === dip.id);
                return (
                  <div key={dip.id} onClick={() => toggleDip(dip.id)}
                    className="rounded-xl p-3 cursor-pointer"
                    style={{ background: sel ? "#1a1a00" : "var(--card)", border: `1px solid ${sel ? "var(--yellow)" : "var(--border)"}` }}>
                    <div className="text-2xl mb-1">{dip.emoji}</div>
                    <div className="text-xs font-semibold">{dip.name}</div>
                    {sel && (
                      <div className="mt-2 flex gap-1" onClick={e => e.stopPropagation()}>
                        {DIP_QTY.map(n => (
                          <button key={n} type="button" onClick={() => setDipQty(dip.id, n)}
                            className="flex-1 rounded py-1 text-xs font-bold"
                            style={{ background: sel.quantity === n ? "var(--yellow)" : "var(--muted)", color: sel.quantity === n ? "#000" : "var(--foreground)" }}>
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Summary + Submit */}
          <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={card}>
            <div className="text-sm" style={muted}>
              {totalWings} wings{sides.length ? ` · ${sides.length} side${sides.length > 1 ? "s" : ""}` : ""}{dips.length ? ` · ${dips.length} dip${dips.length > 1 ? "s" : ""}` : ""}
            </div>
            <span className="font-black" style={{ color: "var(--green)" }}>{participantName}</span>
          </div>

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}

          <button type="submit" disabled={submitting || wings.some(w => !w.flavorId)}
            className="w-full rounded-lg py-3.5 text-sm font-bold disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--green)", color: "#000" }}>
            {submitting ? "Submitting…" : isEditing ? "🔄 Update Order" : "🍗 Submit Order"}
          </button>
        </form>
      </div>
    </main>
  );
}
