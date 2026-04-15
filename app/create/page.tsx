"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateOrderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create order.");
        return;
      }

      const { session } = await res.json();
      router.push(`/admin/${session.code}`);
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
      <div className="w-full max-w-sm mb-6">
        <Link href="/" className="text-sm flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
          ← Back
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-4xl mb-3">🍗</div>
        <h1 className="text-2xl font-extrabold mb-1">New Order</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
          Give your order a name and share the join code with your crew.
        </p>

        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="order-name" className="block text-sm font-medium mb-1.5">
                Order name
              </label>
              <input
                id="order-name"
                type="text"
                placeholder="e.g. Friday Office Lunch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {loading ? "Creating..." : "Create Order"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
