import { NextResponse } from "next/server";
import { redis, allReviews, isAdmin, Review } from "@/lib/db";
export const dynamic = "force-dynamic";
const no = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export async function GET(req: Request) {
  if (!isAdmin(req)) return no();
  const all = await allReviews(); const ok = all.filter(r => r.status === "approved");
  return NextResponse.json({ reviews: all, count: ok.length,
    average: ok.length ? Math.round((ok.reduce((s, r) => s + r.rating, 0) / ok.length) * 10) / 10 : 0 });
}
export async function PATCH(req: Request) {
  if (!isAdmin(req)) return no();
  const { id, action } = await req.json().catch(() => ({}));
  const r = await redis.hget<Review>("reviews", String(id));
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (action === "approve") r.status = "approved";
  else if (action === "reject") { r.status = "rejected"; r.featured = false; }
  else if (action === "verify") r.verified = !r.verified;
  else if (action === "feature") r.featured = !r.featured;
  else return NextResponse.json({ error: "Bad action" }, { status: 400 });
  await redis.hset("reviews", { [r.id]: r });
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  if (!isAdmin(req)) return no();
  await redis.hdel("reviews", String(new URL(req.url).searchParams.get("id")));
  return NextResponse.json({ ok: true });
}
