import { cache } from "react";
import { redis, clean } from "./db";
const L = (a: string, b: string) => ({ id: "", platform: a, url: b, enabled: false });
export const defaults: any = {
  profile: { name: "Surya Teja", title: "Short-Form Video Editor", tagline: "Reels • Shorts • Social Ads • Personal Brands", bio: "I'm a short-form video editor focused on turning raw footage into engaging Reels, Shorts and social content. I combine storytelling, pacing, captions, sound design and color to make every second work harder. My goal isn't just to make videos look good — it's to make them perform.", photo: "", logo: "", availability: "Available for projects" },
  hero: { eyebrow: "SHORT-FORM VIDEO EDITOR", headline: "I TURN RAW FOOTAGE INTO", headlineAccent: "CONTENT PEOPLE CAN'T SCROLL PAST.", sub: "", desc: "I edit short-form content with sharper pacing, cleaner storytelling and visuals designed to hold attention from the first second to the last.", cta1Text: "Start a Project →", cta1Url: "#contact", cta2Text: "View My Work", cta2Url: "#work",
    stats: [{ id: "", k: "REELS / SHORTS", v: "SHORT-FORM" }, { id: "", k: "CLIENT-FOCUSED", v: "FAST DELIVERY" }, { id: "", k: "STORY + RETENTION", v: "EDITING STYLE" }] },
  intro: { published: false, heading: "LET'S MAKE YOUR CONTENT IMPOSSIBLE TO IGNORE.", title: "Meet the Editor", desc: "", video: "", thumb: "", autoplay: false, controls: true, muted: true },
  services: { heading: "THE EDITING BEHIND THE ATTENTION.", desc: "Every cut has a purpose. Every frame should move the story forward.",
    svc: [["Sound Design", "🔊", "Punchier sound effects, cleaner dialogue and layered audio that gives every moment more impact.", "SFX, Dialogue, Music, Mixing"], ["Captions", "💬", "Dynamic captions designed for mobile viewing, readability and retention.", "Dynamic Captions, Kinetic Text, Brand Style"], ["Pacing", "⚡", "Strategic cuts, pattern interrupts and timing that keeps viewers moving through the story.", "Hooks, Jump Cuts, B-Roll, Retention"], ["Color Grading", "🎨", "Clean, cinematic color treatment that gives your content a recognizable visual identity.", "Color Correction, Skin Tones, Cinematic Grade"]]
      .map(([title, icon, desc, tags], i) => ({ id: "s" + i, title, icon, desc, tags, price: "", featured: false, published: true })) },
  portfolio: { heading: "SELECTED WORK", desc: "Different niches. One goal: make the viewer stay.", allLabel: "All", empty: "Your portfolio is empty. Add your first project.", watchLabel: "Watch Edit",
    works: [] },
  reviews: { heading: "THE EDITS SPEAK. THE CLIENTS CONFIRM.", desc: "Great editing should make the content stronger — and working together should feel effortless.", empty: "No reviews yet.", formTitle: "Leave a review", submitText: "Submit review →" },
  contact: { heading: "Say Hello 👋", desc: "Whether you need video editing, poster design, or a full digital marketing campaign — I'm just a message away.", email: "suryateja@email.com", whatsapp: "916303002932", location: "Andhra Pradesh, India", emailCta: "Email me →", waCta: "Chat on WhatsApp →", formHeading: "Send a message", lName: "Your Name", lEmail: "Email Address", lService: "Service Needed", lMsg: "Your Message", servicePlaceholder: "Select a service", submit: "Send Message", success: "Thanks — I'll get back to you shortly." },
  social: { slinks: [L("Instagram", ""), L("LinkedIn", ""), L("YouTube", ""), L("X / Twitter", ""), L("TikTok", "")] },
  footer: { desc: "Short-form video editor turning raw footage into scroll-stopping content.", copyright: "© 2026 Surya Teja. All rights reserved.", cta: "Start a Project →", ctaUrl: "#contact", flinks: [["Home", "#home"], ["Work", "#work"], ["Reviews", "#reviews"], ["Contact", "#contact"]].map(([label, url]) => ({ id: "", label, url })) },
  settings: { siteTitle: "Surya Teja — Short-Form Video Editor | Reels, Shorts & Social Content", metaDesc: "Short-form video editor specializing in Reels, YouTube Shorts, social ads, captions, sound design, pacing and cinematic editing.", navHome: "Home", navWork: "Work", navReviews: "Reviews", navContact: "Contact", navCta: "Let's Work Together →", waEnabled: true, waTooltip: "Chat with me on WhatsApp", waPos: "left" },
};
const W = { id: "", title: "", desc: "", client: "", category: "Other", tags: "", featured: false, status: "draft", video: "", thumb: "", beforeVideo: "", afterVideo: "" };
const ITEM: any = { svc: { id: "", title: "", icon: "✨", desc: "", tags: "", price: "", featured: false, published: true }, works: W, slinks: L("", ""), flinks: { id: "", label: "", url: "" }, stats: { id: "", k: "", v: "" } };
export function san(t: any, v: any, key = ""): any {
  if (Array.isArray(t)) { const it = ITEM[key]; return Array.isArray(v) && it ? v.slice(0, 100).map(x => san(it, x)) : t; }
  if (t && typeof t === "object") { const o: any = {}; for (const k in t) o[k] = san(t[k], v?.[k], k); return o; }
  if (typeof t === "boolean") return typeof v === "boolean" ? v : t;
  const s = clean(v ?? t, key === "bio" || key === "desc" ? 2000 : 400);
  return /^\s*(javascript|data|vbscript):/i.test(s) ? "" : s;
}
export const getContent = cache(async () => {
  try { return san(defaults, (await redis.hgetall("site")) || {}); } catch { return san(defaults, {}); }
});
export const digits = (n: string) => String(n).replace(/\D/g, "");
export const waLink = (n: string) => `https://wa.me/${digits(n)}`;
export const fmtPhone = (n: string) => { const d = digits(n); return d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : "+" + d; };
