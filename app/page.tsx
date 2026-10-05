import Reviews from "@/components/Reviews";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import { getContent, waLink, fmtPhone } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Home() {
  const c = await getContent(); const { profile: p, hero: h, intro: i, services: s, portfolio: pf, contact: ct, social, footer: f, settings: st } = c;
  const wa = waLink(ct.whatsapp), svcs = s.svc.filter((x: any) => x.published), works = pf.works.filter((x: any) => x.status === "published");
  const socials = social.slinks.filter((x: any) => x.enabled && x.url);
  return (<>
    <nav className="nav"><a href="#home">{p.logo ? <img src={p.logo} alt={p.name} height={28} /> : <b>{p.name}</b>}</a>
      <span><a href="#home">{st.navHome}</a><a href="#work">{st.navWork}</a><a href="#reviews">{st.navReviews}</a><a href="#contact">{st.navContact}</a></span><a className="btn" href="#contact">{st.navCta}</a></nav>
    <main>
      <section id="home" className="wrap hero"><div><p className="eyebrow">{h.eyebrow}</p>
        <h1>{h.headline} <span className="grad">{h.headlineAccent}</span></h1>{h.sub && <p><b>{h.sub}</b></p>}
        <p className="muted">{h.desc}</p><p className="muted">{p.tagline}</p>
        <a className="btn" href={h.cta1Url}>{h.cta1Text}</a> <a className="btn ghost" href={h.cta2Url}>{h.cta2Text}</a>
        <div className="row stats">{h.stats.map((x: any, n: number) => <div key={n} className="glass"><small className="eyebrow">{x.v}</small><br />{x.k}</div>)}</div></div>
        <div className="glass ph">{p.photo ? <img src={p.photo} alt={p.name} className="portrait" /> : "Upload a profile photo in /admin"}<span className="tag">● {p.availability}</span></div></section>
      <section className="wrap"><h2>About</h2><p className="muted">{p.bio}</p></section>
      {i.published && i.video && <section className="wrap"><h2>{i.heading}</h2><div className="glass"><p className="eyebrow">{i.title}</p>
        <video src={i.video} poster={i.thumb || undefined} controls={i.controls} muted={i.muted} autoPlay={i.autoplay && i.muted} loop={i.autoplay} playsInline className="vid" /><p className="muted">{i.desc}</p></div></section>}
      <section id="services" className="wrap"><h2>{s.heading}</h2><p className="muted">{s.desc}</p>
        <div className="grid">{svcs.map((x: any) => <article key={x.id} className="glass"><div style={{ fontSize: 28 }}>{x.icon}</div><h3>{x.title}{x.featured && " ★"}</h3><p className="muted">{x.desc}</p>
          {x.price && <p className="eyebrow">{x.price}</p>}<div className="row">{x.tags.split(",").filter((t: string) => t.trim()).map((t: string) => <span key={t} className="tag">{t.trim()}</span>)}</div></article>)}</div></section>
      <section id="work" className="wrap"><p className="eyebrow">{pf.heading}</p><h2>{pf.desc}</h2><Portfolio works={works} t={pf} /></section>
      <Reviews t={c.reviews} />
      <section id="contact" className="wrap"><Contact c={ct} services={svcs.map((x: any) => x.title)} wa={wa} phone={fmtPhone(ct.whatsapp)} socials={socials} /></section>
    </main>
    <footer className="wrap"><b>{p.name}</b><p className="muted">{f.desc}</p><div className="row">{f.flinks.map((l: any) => <a key={l.label} href={l.url}>{l.label}</a>)}</div>
      <div className="row">{socials.map((x: any) => <a key={x.platform} href={x.url} target="_blank" rel="noopener noreferrer">{x.platform}</a>)}</div>
      <a className="btn" href={f.ctaUrl}>{f.cta}</a><p className="muted">{f.copyright}</p></footer>
    {st.waEnabled && <a href={wa} className="wa" style={st.waPos === "right" ? { right: 24, left: "auto" } : undefined} aria-label={st.waTooltip} title={st.waTooltip}>💬</a>}
  </>);
}
