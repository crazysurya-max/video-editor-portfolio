import { NextResponse } from "next/server";
import { redis, isAdmin } from "@/lib/db";
import { defaults, san, getContent } from "@/lib/content";
export const dynamic = "force-dynamic";
const no = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export async function GET(req: Request) { return isAdmin(req) ? NextResponse.json(await getContent()) : no(); }
export async function PUT(req: Request) {
  if (!isAdmin(req)) return no();
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const s = san(defaults, b);
  await redis.hset("site", s); // one hash field per section: profile, hero, intro, services, portfolio, reviews, contact, social, footer, settings
  return NextResponse.json(s);
}
