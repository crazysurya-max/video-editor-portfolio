"use client";
import { useEffect, useState } from "react";
export default function Admin() {
  const [data, setData] = useState<any>(null); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const load = async () => { const r = await fetch("/api/admin/reviews"); setData(r.ok ? await r.json() : null); };
  useEffect(() => { load(); }, []);
  const login = async (e: React.FormEvent) => { e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
    if (r.ok) { setErr(""); load(); } else setErr("Login failed"); };
  const act = async (id: string, action: string) => { await fetch("/api/admin/reviews", { method: "PATCH", body: JSON.stringify({ id, action }) }); load(); };
  const del = async (id: string) => { if (confirm("Delete permanently?")) { await fetch("/api/admin/reviews?id=" + id, { method: "DELETE" }); load(); } };
  if (!data) return (<main className="wrap"><h1>Admin</h1><form onSubmit={login} className="glass">
    <label>Password<input type="password" value={pw} onChange={e => setPw(e.target.value)} /></label>
    <button className="btn">Log in</button>{err && <p role="alert">{err}</p>}</form></main>);
  return (<main className="wrap"><h1>Reviews admin</h1>
    <p>Approved: {data.count} · Average: {data.average}★</p>
    {data.reviews.map((r: any) => (<article key={r.id} className="glass">
      <b>{r.name}</b> {r.company && `· ${r.company}`} · {"★".repeat(r.rating)} · <em>{r.status}</em>
      {r.verified && " ✔ verified"}{r.featured && " ⭐ featured"}
      <p>{r.text}</p>
      <div className="row">
        <button className="btn" onClick={() => act(r.id, "approve")}>Approve</button>
        <button className="btn" onClick={() => act(r.id, "reject")}>Reject</button>
        <button className="btn" onClick={() => act(r.id, "verify")}>Verified</button>
        <button className="btn" onClick={() => act(r.id, "feature")}>Feature</button>
        <button className="btn" onClick={() => del(r.id)}>Delete</button></div></article>))}
  </main>);
}
