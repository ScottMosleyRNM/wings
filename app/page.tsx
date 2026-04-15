"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"join" | "admin" | null>(null);

  async function navigate(dest: "order" | "admin") {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setError("");
    setLoading(dest === "order" ? "join" : "admin");
    try {
      const res = await fetch(`/api/orders/${trimmed}`);
      if (!res.ok) { setError("Order not found. Double-check your code."); return; }
      router.push(`/${dest}/${trimmed}`);
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(null); }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="mb-10 text-center">
        <div className="text-7xl mb-3 flex items-center justify-center gap-2">🍗🍟🥣</div>
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--green)" }}>Wings Calculator</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>Group Wingstop orders, made easy</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl p-6 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-semibold mb-1">Enter a join code</h2>
        <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Participant or organizer — same code</p>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="e.g. A3X2BQ"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={10}
            onKeyDown={(e) => e.key === "Enter" && navigate("order")}
            className="w-full rounded-lg px-4 py-3 text-lg font-black font-mono tracking-[0.3em] uppercase text-center focus:outline-none"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={() => navigate("order")}
            disabled={!!loading || !code.trim()}
            className="w-full rounded-lg py-3 text-sm font-bold disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--green)", color: "#000" }}
          >
            {loading === "join" ? "Checking..." : "🍗 Join Order"}
          </button>
          <button
            onClick={() => navigate("admin")}
            disabled={!!loading || !code.trim()}
            className="w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--muted)", color: "var(--yellow)", border: "1px solid var(--border)" }}
          >
            {loading === "admin" ? "Loading..." : "📊 Admin Dashboard"}
          </button>
        </div>
      </div>

      <div className="flex items-center w-full max-w-sm gap-3 my-1">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      <div className="w-full max-w-sm mt-3">
        <Link href="/create" className="block w-full rounded-lg py-3 text-sm font-semibold text-center"
          style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          Start a new group order
        </Link>
      </div>
    </main>
  );
}
