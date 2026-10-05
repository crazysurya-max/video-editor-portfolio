import { NextResponse } from "next/server";
import { redis, isAdmin, clean, limited } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true });
  if (await limited(req, "msg", 5, 3600)) return NextResponse.json({ error: "Too many messages. Try later." }, { status: 429 });
  const name = clean(b.name, 80), email = clean(b.email, 120), message = clean(b.message, 2000);
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 5) return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
  const id = crypto.randomUUID();
  await redis.hset("messages", { [id]: { id, name, email, service: clean(b.service, 100), message, createdAt: Date.now() } });
  return NextResponse.json({ ok: true });
}
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const h: any = (await redis.hgetall("messages")) || {};
  return NextResponse.json(Object.values(h).sort((a: any, b: any) => b.createdAt - a.createdAt));
}
export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await redis.hdel("messages", String(new URL(req.url).searchParams.get("id")));
  return NextResponse.json({ ok: true });
}
