"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { FLAVORS, HEAT_LABELS, HEAT_COLORS, WING_COUNTS } from "@/lib/flavors";
import type { OrderSession, WingSelection } from "@/lib/types";
import { normalizeKey } from "@/lib/utils";

interface Selection {
  flavorId: string;
  quantity: number;
  style: "classic" | "boneless";
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const [session, setSession] = useState<OrderSession | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  const [participantName, setParticipantName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [existingOrder, setExistingOrder] = useState<Selection[]>([]);

  const [selections, setSelections] = useState<Selection[]>([
    { flavorId: "", quantity: 10, style: "classic" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${code}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setSession(data.session); })
      .finally(() => setLoadingSession(false));
  }, [code]);

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participantName.trim() || !session) return;
    const key = normalizeKey(participantName.trim());
    const existing = session.orders[key];
    if (existing) {
      setExistingOrder(existing.selections.map((s: WingSelection) => ({ ...s })));
      setSelections(existing.selections.map((s: WingSelection) => ({ ...s })));
    }
    setNameSubmitted(true);
  }

  function addRow() {
    setSelections((prev) => [...prev, { flavorId: "", quantity: 10, style: "classic" }]);
  }

  function removeRow(i: number) {
    setSelections((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof Selection, value: string | number) {
    setSelections((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (selections.some((s) => !s.flavorId)) {
      setSubmitError("Please select a flavor for each row.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: participantName.trim(), selections }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Failed to submit. Try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalWings = selections.reduce((sum, s) => sum + s.quantity, 0);

  if (loadingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Loading order…</p>
      </main>
    );
  }

  if (notFound || !session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-5xl mb-4">🤔</div>
        <h1 className="text-xl font-bold mb-2">Order not found</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>That code doesn&apos;t match any active order.</p>
        <Link href="/" className="text-sm" style={{ color: "var(--accent)" }}>← Back to home</Link>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-extrabold mb-2">Order submitted!</h1>
        <p className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>
          {totalWings} wings for <strong>{participantName}</strong>
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
          Come back with code <span className="font-mono font-bold" style={{ color: "var(--accent)" }}>{code}</span> to edit your order.
        </p>
        <button
          onClick={() => { setSubmitted(false); setNameSubmitted(false); setParticipantName(""); setSelections([{ flavorId: "", quantity: 10, style: "classic" }]); setExistingOrder([]); }}
          className="text-sm rounded-lg px-5 py-2.5 font-semibold"
          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          Submit another order
        </button>
      </main>
    );
  }

  if (!nameSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-sm mb-6">
          <Link href="/" className="text-sm flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>← Back</Link>
        </div>
        <div className="w-full max-w-sm">
          <p className="text-xs font-mono mb-1" style={{ color: "var(--accent)" }}>{session.name}</p>
          <h1 className="text-2xl font-extrabold mb-1">What&apos;s your name?</h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>Use the same name to come back and edit your order.</p>
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                maxLength={40}
                autoFocus
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
              />
              <button
                type="submit"
                disabled={!participantName.trim()}
                className="w-full rounded-lg py-3 text-sm font-semibold disabled:opacity-50 cursor-pointer"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <p className="text-xs font-mono mb-1" style={{ color: "var(--accent)" }}>{session.name}</p>
          <h1 className="text-2xl font-extrabold">Pick your wings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {existingOrder.length > 0 ? `Editing order for ${participantName}` : `Ordering for ${participantName}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selections.map((row, i) => (
            <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Item {i + 1}</span>
                {selections.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} className="text-xs px-2 py-0.5 rounded" style={{ color: "var(--muted-foreground)", background: "var(--muted)" }}>Remove</button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Flavor</label>
                <select
                  value={row.flavorId}
                  onChange={(e) => updateRow(i, "flavorId", e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                >
                  <option value="">Select a flavor…</option>
                  {FLAVORS.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} — {HEAT_LABELS[f.heat]}</option>
                  ))}
                </select>
                {row.flavorId && (() => {
                  const f = FLAVORS.find((fl) => fl.id === row.flavorId)!;
                  return <p className={`text-xs mt-1 ${HEAT_COLORS[f.heat]}`}>{f.description}</p>;
                })()}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Style</label>
                <div className="flex gap-2">
                  {(["classic", "boneless"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => updateRow(i, "style", s)}
                      className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors capitalize"
                      style={{ background: row.style === s ? "var(--accent)" : "var(--muted)", color: row.style === s ? "#fff" : "var(--foreground)", border: `1px solid ${row.style === s ? "var(--accent)" : "var(--border)"}` }}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Quantity</label>
                <div className="flex flex-wrap gap-2">
                  {WING_COUNTS.map((n) => (
                    <button key={n} type="button" onClick={() => updateRow(i, "quantity", n)}
                      className="rounded-lg px-3 py-1.5 text-sm font-mono font-semibold transition-colors"
                      style={{ background: row.quantity === n ? "var(--accent)" : "var(--muted)", color: row.quantity === n ? "#fff" : "var(--foreground)", border: `1px solid ${row.quantity === n ? "var(--accent)" : "var(--border)"}` }}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addRow}
            className="w-full rounded-xl py-2.5 text-sm font-medium"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px dashed var(--border)" }}
          >+ Add another flavor</button>

          <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total wings</span>
            <span className="font-bold text-lg" style={{ color: "var(--accent)" }}>{totalWings}</span>
          </div>

          {submitError && <p className="text-sm text-red-400">{submitError}</p>}

          <button type="submit" disabled={submitting || selections.some((s) => !s.flavorId)}
            className="w-full rounded-lg py-3.5 text-sm font-semibold disabled:opacity-50 cursor-pointer"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {submitting ? "Submitting…" : existingOrder.length > 0 ? "Update Order" : "Submit Order"}
          </button>
        </form>
      </div>
    </main>
  );
}
