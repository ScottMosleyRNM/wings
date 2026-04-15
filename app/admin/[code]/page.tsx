"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { FLAVORS } from "@/lib/flavors";
import type { OrderSession, WingSelection } from "@/lib/types";

interface FlavorTally {
  flavorId: string;
  name: string;
  classic: number;
  boneless: number;
  total: number;
}

function buildTally(session: OrderSession): FlavorTally[] {
  const map: Record<string, FlavorTally> = {};
  for (const order of Object.values(session.orders)) {
    for (const sel of order.selections as WingSelection[]) {
      if (!map[sel.flavorId]) {
        const flavor = FLAVORS.find((f) => f.id === sel.flavorId);
        map[sel.flavorId] = { flavorId: sel.flavorId, name: flavor?.name ?? sel.flavorId, classic: 0, boneless: 0, total: 0 };
      }
      if (sel.style === "classic") map[sel.flavorId].classic += sel.quantity;
      else map[sel.flavorId].boneless += sel.quantity;
      map[sel.flavorId].total += sel.quantity;
    }
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export default function AdminPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [session, setSession] = useState<OrderSession | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function fetchSession(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${code}`, { cache: "no-store" });
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      setSession(data.session);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchSession(); }, [code]);

  function copyJoinLink() {
    const url = `${window.location.origin}/order/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Loading dashboard…</p>
      </main>
    );
  }

  if (notFound || !session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-5xl mb-4">🤔</div>
        <h1 className="text-xl font-bold mb-2">Order not found</h1>
        <Link href="/" className="text-sm" style={{ color: "var(--accent)" }}>← Back to home</Link>
      </main>
    );
  }

  const participantList = Object.values(session.orders);
  const tally = buildTally(session);
  const grandTotal = tally.reduce((sum, t) => sum + t.total, 0);
  const classicTotal = tally.reduce((sum, t) => sum + t.classic, 0);
  const bonelessTotal = tally.reduce((sum, t) => sum + t.boneless, 0);

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-xs mb-2 block" style={{ color: "var(--muted-foreground)" }}>← Home</Link>
            <h1 className="text-2xl font-extrabold">{session.name}</h1>
            <p className="text-xs mt-1 font-mono" style={{ color: "var(--muted-foreground)" }}>
              Code: <span style={{ color: "var(--accent)" }}>{code}</span>
            </p>
          </div>
          <button onClick={() => fetchSession(true)} disabled={refreshing}
            className="text-sm rounded-lg px-3 py-1.5 font-medium disabled:opacity-50"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >{refreshing ? "…" : "↻ Refresh"}</button>
        </div>

        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted-foreground)" }}>Share this join code</p>
            <p className="text-2xl font-black font-mono tracking-widest" style={{ color: "var(--accent)" }}>{code}</p>
          </div>
          <button onClick={copyJoinLink}
            className="text-sm rounded-lg px-4 py-2 font-semibold shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >{copied ? "Copied!" : "Copy link"}</button>
        </div>

        {participantList.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="text-4xl mb-3">⏳</div>
            <p className="font-semibold mb-1">No orders yet</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Share the join code with your crew so they can submit their orders.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[{ label: "Participants", value: participantList.length }, { label: "Total Wings", value: grandTotal }, { label: "Flavors", value: tally.length }].map(({ label, value }) => (
                <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Flavor Breakdown</h2>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="grid grid-cols-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  <span className="col-span-2">Flavor</span>
                  <span className="text-center">Classic</span>
                  <span className="text-center">Boneless</span>
                </div>
                {tally.map((t, i) => (
                  <div key={t.flavorId} className="grid grid-cols-4 px-4 py-3 text-sm items-center"
                    style={{ borderBottom: i < tally.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div className="col-span-2">
                      <span className="font-medium">{t.name}</span>
                      <span className="ml-2 text-xs font-bold" style={{ color: "var(--accent)" }}>{t.total}</span>
                    </div>
                    <span className="text-center text-sm" style={{ color: t.classic > 0 ? "var(--foreground)" : "var(--muted-foreground)" }}>{t.classic > 0 ? t.classic : "—"}</span>
                    <span className="text-center text-sm" style={{ color: t.boneless > 0 ? "var(--foreground)" : "var(--muted-foreground)" }}>{t.boneless > 0 ? t.boneless : "—"}</span>
                  </div>
                ))}
                <div className="grid grid-cols-4 px-4 py-3 text-sm font-bold" style={{ borderTop: "2px solid var(--border)", background: "var(--muted)" }}>
                  <div className="col-span-2">Total <span style={{ color: "var(--accent)" }}>{grandTotal}</span></div>
                  <span className="text-center">{classicTotal > 0 ? classicTotal : "—"}</span>
                  <span className="text-center">{bonelessTotal > 0 ? bonelessTotal : "—"}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Individual Orders ({participantList.length})</h2>
              <div className="space-y-3">
                {participantList.map((order) => {
                  const orderTotal = order.selections.reduce((s: number, sel: WingSelection) => s + sel.quantity, 0);
                  return (
                    <div key={order.name} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{order.name}</span>
                        <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{orderTotal} wings</span>
                      </div>
                      <div className="space-y-1.5">
                        {(order.selections as WingSelection[]).map((sel, i) => {
                          const flavor = FLAVORS.find((f) => f.id === sel.flavorId);
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span style={{ color: "var(--muted-foreground)" }}>{flavor?.name ?? sel.flavorId} <span className="capitalize text-xs">({sel.style})</span></span>
                              <span className="font-mono font-medium">{sel.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
