import { kv } from "@vercel/kv";
import type { OrderSession } from "./types";

const SESSION_TTL = 60 * 60 * 24 * 7;

export async function getSession(code: string): Promise<OrderSession | null> {
  return kv.get<OrderSession>(`session:${code.toUpperCase()}`);
}

export async function saveSession(session: OrderSession): Promise<void> {
  await kv.set(`session:${session.code}`, session, { ex: SESSION_TTL });
}

export async function createSession(name: string, code: string): Promise<OrderSession> {
  const session: OrderSession = {
    code,
    name,
    createdAt: new Date().toISOString(),
    orders: {},
  };
  await saveSession(session);
  return session;
}
