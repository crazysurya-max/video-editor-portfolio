import { Redis } from "@upstash/redis";
import crypto from "crypto";
export const redis = Redis.fromEnv();
export type Review = { id: string; name: string; company: string; rating: number; text: string; photo: string;
  status: "pending" | "approved" | "rejected"; verified: boolean; featured: boolean; createdAt: number };
export const clean = (s: unknown, max: number) =>
  String(s ?? "").replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const sign = (v: string) => crypto.createHmac("sha256", process.env.SESSION_SECRET || "").update(v).digest("hex");
export const makeToken = () => { const e = String(Date.now() + 7 * 864e5); return e + "." + sign(e); };
export function isAdmin(req: Request) {
  if (!process.env.SESSION_SECRET) return false;
  const m = /(?:^|;\s*)admin=([^;]+)/.exec(req.headers.get("cookie") || "");
  if (!m) return false;
  const [e, s] = m[1].split(".");
  if (!e || !s || Number(e) < Date.now()) return false;
  const x = sign(e);
  return s.length === x.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(x));
}
export async function allReviews() {
  const h = await redis.hgetall<Record<string, Review>>("reviews");
  return Object.values(h || {}).sort((a, b) => b.createdAt - a.createdAt);
}
export async function limited(req: Request, key: string, max: number, secs: number) {
  const ip = (req.headers.get("x-forwarded-for") || "x").split(",")[0].trim();
  const k = `rl:${key}:${ip}`;
  const n = await redis.incr(k);
  if (n === 1) await redis.expire(k, secs);
  return n > max;
}
