import { NextResponse } from "next/server";
import { redis, allReviews, clean, limited, Review } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const ok = (await allReviews()).filter(r => r.status === "approved")
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt);
  const count = ok.length;
  const average = count ? Math.round((ok.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  return NextResponse.json({ count, average, reviews: ok });
}
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: silently drop bots
  if (await limited(req, "submit", 3, 3600)) return NextResponse.json({ error: "Too many submissions. Try later." }, { status: 429 });
  const rating = Number(b.rating), name = clean(b.name, 60), text = clean(b.text, 1000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || name.length < 2 || text.length < 10)
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  const photo = typeof b.photo === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.photo) && b.photo.length < 30000 ? b.photo : "";
  const id = crypto.randomUUID();
  const r: Review = { id, name, company: clean(b.company, 80), rating, text, photo, status: "pending", verified: false, featured: false, createdAt: Date.now() };
  await redis.hset("reviews", { [id]: r });
  return NextResponse.json({ ok: true });
}
