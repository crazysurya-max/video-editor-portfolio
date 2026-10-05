import { NextResponse } from "next/server";
import crypto from "crypto";
import { limited, makeToken } from "@/lib/db";
export async function POST(req: Request) {
  if (await limited(req, "login", 8, 900)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const { password } = await req.json().catch(() => ({ password: "" }));
  const a = Buffer.from(String(password)), b = Buffer.from(process.env.ADMIN_PASSWORD || "\0");
  if (!process.env.ADMIN_PASSWORD || a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", makeToken(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 604800 });
  return res;
}
