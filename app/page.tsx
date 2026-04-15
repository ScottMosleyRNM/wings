"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${code.trim().toUpperCase()}`);
      if (!res.ok) {
        setError("Order not found. Double-check your code.");
        return;
      }
      router.push(`/order/${code.trim().toUpperCase()}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">🍗</div>
        <h1
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--accent)" }}
        >
          Wings Calculator
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Group Wingstop orders, made easy
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-2xl p-6 mb-4"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-lg font-semibold mb-4">Join an order</h2>
        <form onSubmit={handleJoin} className="space-y-3">
          <input
            type="text"
            placeholder="Enter join code (e.g. A3X2BQ)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={10}
            className="w-full rounded-lg px-4 py-3 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2"
            style={{
              background: "var(--muted)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? "Checking..." : "Join Order"}
          </button>
        </form>
      </div>

      <div className="flex items-center w-full max-w-sm gap-3 my-1">
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      <div className="w-full max-w-sm mt-3">
        <Link
          href="/create"
          className="block w-full rounded-lg py-3 text-sm font-semibold text-center transition-colors"
          style={{
            background: "var(--muted)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          Create a new order
        </Link>
      </div>
    </main>
  );
}
