"use client";
import { useEffect, useState } from "react";
async function shrink(f: File): Promise<string> { // resize to 96px JPEG so it stays tiny
  const img = await createImageBitmap(f); const c = document.createElement("canvas"); c.width = c.height = 96;
  const s = Math.min(img.width, img.height); c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 96, 96);
  return c.toDataURL("image/jpeg", 0.7); }
export default function Reviews({ t }: { t: any }) {
  const [d, setD] = useState<any>({ count: 0, average: 0, reviews: [] });
  const [rating, setRating] = useState(5); const [photo, setPhoto] = useState(""); const [msg, setMsg] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => { fetch("/api/reviews").then(r => r.json()).then(setD); }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/reviews", { method: "POST", body: JSON.stringify({ rating, photo, name: f.get("name"), company: f.get("company"), text: f.get("text"), website: f.get("website") }) });
    const j = await r.json(); if (r.ok) setDone(true); else setMsg(j.error); }
  return (<section id="reviews" className="wrap">
    <p className="eyebrow">REVIEWS</p><h2>{t.heading}</h2><p className="muted">{t.desc}</p>{d.count === 0 && <p className="muted">{t.empty}</p>}
    {d.count > 0 && <p aria-live="polite">{d.average}★ average · {d.count} review{d.count > 1 ? "s" : ""}</p>}
    <div className="grid">{d.reviews.map((r: any) => (<article key={r.id} className="glass">
      <div className="row">{r.photo ? <img src={r.photo} alt={`${r.name}'s photo`} width={48} height={48} className="av" /> : <div className="av" />}
        <div><b>{r.name}</b>{r.verified && " ✔ Verified client"}<br /><small>{r.company}</small></div></div>
      <p aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p><p>{r.text}</p></article>))}</div>
    {done ? <p className="glass">Thanks! Your review will appear once approved.</p> :
    <form onSubmit={submit} className="glass"><h3>{t.formTitle}</h3>
      <div role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map(n => (<button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} stars`} className={"star" + (n <= rating ? " on" : "")} onClick={() => setRating(n)}>★</button>))}</div>
      <label>Name *<input name="name" required minLength={2} maxLength={60} /></label>
      <label>Company<input name="company" maxLength={80} /></label>
      <label>Review *<textarea name="text" required minLength={10} maxLength={1000} rows={4} /></label>
      <label>Photo (optional)<input type="file" accept="image/*" onChange={async e => e.target.files?.[0] && setPhoto(await shrink(e.target.files[0]))} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px" }} />
      <button className="btn">{t.submitText}</button>{msg && <p role="alert">{msg}</p>}</form>}
  </section>);
}
