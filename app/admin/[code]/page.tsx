"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { FLAVORS, SIDES, DIPS } from "@/lib/menu";
import type { OrderSession, WingOrder, SideOrder, DipOrder } from "@/lib/types";

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
      setSession((await res.json()).session);
    } finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { fetchSession(); }, [code]);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/order/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const card = { background: "var(--card)", border: "1px solid var(--border)" };
  const muted = { color: "var(--muted-foreground)" };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <p style={muted}>Loading…</p>
    </main>
  );
  if (notFound || !session) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <h1 className="text-xl font-bold mb-2">Order not found</h1>
      <Link href="/" style={{ color: "var(--green)" }}>← Home</Link>
    </main>
  );

  const orders = Object.values(session.orders);

  // Wing tally
  const wingMap: Record<string, { name: string; classic: number; boneless: number }> = {};
  for (const o of orders)
    for (const w of (o.wings ?? []) as WingOrder[]) {
      if (!wingMap[w.flavorId]) wingMap[w.flavorId] = { name: FLAVORS.find(f => f.id === w.flavorId)?.name ?? w.flavorId, classic: 0, boneless: 0 };
      wingMap[w.flavorId][w.style] += w.quantity;
    }
  const wingTally = Object.entries(wingMap).map(([id, v]) => ({ id, ...v, total: v.classic + v.boneless })).sort((a, b) => b.total - a.total);
  const totalWings = wingTally.reduce((s, t) => s + t.total, 0);

  // Side tally
  const sideMap: Record<string, { name: string; emoji: string; total: number }> = {};
  for (const o of orders)
    for (const s of (o.sides ?? []) as SideOrder[]) {
      if (!sideMap[s.sideId]) { const x = SIDES.find(x => x.id === s.sideId); sideMap[s.sideId] = { name: x?.name ?? s.sideId, emoji: x?.emoji ?? "🍟", total: 0 }; }
      sideMap[s.sideId].total += s.quantity;
    }
  const sideTally = Object.values(sideMap).sort((a, b) => b.total - a.total);

  // Dip tally (now DipOrder with quantity)
  const dipMap: Record<string, { name: string; emoji: string; total: number }> = {};
  for (const o of orders)
    for (const d of (o.dips ?? []) as DipOrder[]) {
      if (!dipMap[d.dipId]) { const x = DIPS.find(x => x.id === d.dipId); dipMap[d.dipId] = { name: x?.name ?? d.dipId, emoji: x?.emoji ?? "🥣", total: 0 }; }
      dipMap[d.dipId].total += d.quantity;
    }
  const dipTally = Object.values(dipMap).sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-xs mb-2 block" style={muted}>← Home</Link>
            <h1 className="text-2xl font-extrabold">{session.name}</h1>
            <p className="text-xs mt-1 font-mono" style={muted}>Code: <span style={{ color: "var(--green)" }}>{code}</span></p>
          </div>
          <button onClick={() => fetchSession(true)} disabled={refreshing}
            className="text-sm rounded-lg px-3 py-1.5 font-medium disabled:opacity-40 shrink-0"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
            {refreshing ? "…" : "↻ Refresh"}
          </button>
        </div>

        {/* Share */}
        <div className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4" style={card}>
          <div>
            <p className="text-xs font-medium mb-0.5" style={muted}>Share join code</p>
            <p className="text-3xl font-black font-mono tracking-widest" style={{ color: "var(--green)" }}>{code}</p>
          </div>
          <button onClick={copyLink} className="text-sm rounded-lg px-4 py-2 font-bold shrink-0"
            style={{ background: "var(--green)", color: "#000" }}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={card}>
            <div className="text-4xl mb-3">⏳</div>
            <p className="font-semibold mb-1">No orders yet</p>
            <p className="text-sm" style={muted}>Share the join code so your crew can submit their orders.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "People",  value: orders.length,                            emoji: "👥" },
                { label: "Wings",   value: totalWings,                               emoji: "🍗" },
                { label: "Sides",   value: sideTally.reduce((s,t)=>s+t.total,0),    emoji: "🍟" },
                { label: "Dips",    value: dipTally.reduce((s,t)=>s+t.total,0),     emoji: "🥣" },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={card}>
                  <div className="text-xl mb-0.5">{emoji}</div>
                  <p className="text-xl font-black" style={{ color: "var(--green)" }}>{value}</p>
                  <p className="text-xs" style={muted}>{label}</p>
                </div>
              ))}
            </div>

            {/* Wings */}
            {wingTally.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={muted}>🍗 Wings</h2>
                <div className="rounded-2xl overflow-hidden" style={card}>
                  <div className="grid grid-cols-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: "1px solid var(--border)", ...muted }}>
                    <span className="col-span-2">Flavor</span><span className="text-center">Classic</span><span className="text-center">Boneless</span>
                  </div>
                  {wingTally.map((t, i) => (
                    <div key={t.id} className="grid grid-cols-4 px-4 py-3 text-sm"
                      style={{ borderBottom: i < wingTally.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div className="col-span-2"><span className="font-medium">{t.name}</span><span className="ml-2 text-xs font-bold" style={{ color: "var(--green)" }}>{t.total}</span></div>
                      <span className="text-center">{t.classic || "—"}</span>
                      <span className="text-center">{t.boneless || "—"}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 px-4 py-3 text-sm font-bold" style={{ borderTop: "2px solid var(--border)", background: "var(--muted)" }}>
                    <span className="col-span-2">Total <span style={{ color: "var(--green)" }}>{totalWings}</span></span>
                    <span className="text-center">{wingTally.reduce((s,t)=>s+t.classic,0) || ""}</span>
                    <span className="text-center">{wingTally.reduce((s,t)=>s+t.boneless,0) || ""}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sides */}
            {sideTally.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={muted}>🍟 Sides</h2>
                <div className="rounded-2xl overflow-hidden" style={card}>
                  {sideTally.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between px-4 py-3 text-sm"
                      style={{ borderBottom: i < sideTally.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span>{s.emoji} {s.name}</span>
                      <span className="font-bold" style={{ color: "var(--yellow)" }}>{s.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dips */}
            {dipTally.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={muted}>🥣 Dipping Sauces</h2>
                <div className="flex flex-wrap gap-2">
                  {dipTally.map(d => (
                    <div key={d.name} className="rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                      style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                      {d.emoji} {d.name} <span className="font-black ml-1" style={{ color: "var(--yellow)" }}>×{d.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual orders */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={muted}>Individual Orders ({orders.length})</h2>
              <div className="space-y-3">
                {orders.map(order => {
                  const wTotal = (order.wings ?? []).reduce((s: number, w: WingOrder) => s + w.quantity, 0);
                  return (
                    <div key={order.name} className="rounded-2xl p-4" style={card}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold">{order.name}</span>
                        <span className="text-sm font-bold" style={{ color: "var(--green)" }}>{wTotal} wings</span>
                      </div>
                      {(order.wings ?? []).length > 0 && (
                        <div className="space-y-1 mb-2">
                          {(order.wings as WingOrder[]).map((w, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span style={muted}>{FLAVORS.find(f=>f.id===w.flavorId)?.name ?? w.flavorId} <span className="capitalize text-xs">({w.style})</span></span>
                              <span className="font-mono">{w.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(order.sides ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(order.sides as SideOrder[]).map((s, i) => {
                            const side = SIDES.find(x => x.id === s.sideId);
                            return <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--yellow)" }}>{side?.emoji} {side?.name ?? s.sideId} ×{s.quantity}</span>;
                          })}
                        </div>
                      )}
                      {(order.dips ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(order.dips as DipOrder[]).map((d, i) => {
                            const dip = DIPS.find(x => x.id === d.dipId);
                            return <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{dip?.emoji} {dip?.name ?? d.dipId} ×{d.quantity}</span>;
                          })}
                        </div>
                      )}
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
