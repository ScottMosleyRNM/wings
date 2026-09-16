import { Redis } from "@upstash/redis";
import type { OrderSession } from "./types";

const redis = new Redis({
  url: process.env.STORAGE_KV_REST_API_URL!,
  token: process.env.STORAGE_KV_REST_API_TOKEN!,
});

const SESSION_TTL = 60 * 60 * 24 * 7;

export async function getSession(code: string): Promise<OrderSession | null> {
  return redis.get<OrderSession>(`session:${code.toUpperCase()}`);
}

export async function saveSession(session: OrderSession): Promise<void> {
  await redis.set(`session:${session.code}`, session, { ex: SESSION_TTL });
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
