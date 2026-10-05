"use client";
import { useState } from "react";

function Card({ w, label }: { w: any; label: string }) {
  const afterSrc = w.afterVideo || w.video;
  const beforeSrc = w.beforeVideo;
  const ba = !!(beforeSrc && afterSrc);
  const [after, setAfter] = useState(true);
  const [ratio, setRatio] = useState<number | null>(null); // width / height, detected automatically
  const src = ba ? (after ? afterSrc : beforeSrc) : afterSrc || beforeSrc;
  const wide = ratio !== null && ratio > 1;
  const box = { aspectRatio: ratio ?? 9 / 16 };

  return (
    <article className={"glass card" + (wide ? " wide" : "")}>
      {src ? (
        <video
          key={src}
          src={src}
          poster={w.thumb || undefined}
          controls
          muted
          playsInline
          preload="metadata"
          className="vid fit"
          style={box}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
          }}
        />
      ) : w.thumb ? (
        <img
          src={w.thumb}
          alt={w.title}
          className="vid fit"
          style={box}
          onLoad={(e) => {
            const i = e.currentTarget;
            if (i.naturalWidth && i.naturalHeight) setRatio(i.naturalWidth / i.naturalHeight);
          }}
        />
      ) : (
        <div className="vid fit ph" style={box}>No video</div>
      )}
      {ba && (
        <div className="row" role="group" aria-label="Before or after">
          <button className={"btn ghost" + (!after ? " act" : "")} onClick={() => setAfter(false)}>
            BEFORE
          </button>
          <button className={"btn ghost" + (after ? " act" : "")} onClick={() => setAfter(true)}>
            AFTER
          </button>
        </div>
      )}
      <p className="eyebrow">
        {w.category}
        {w.featured && " · ★ FEATURED"}
      </p>
      <h3>{w.title}</h3>
      {w.client && <small className="muted">{w.client}</small>}
      <p className="muted">{w.desc}</p>
      <div className="row">
        {w.tags
          .split(",")
          .filter((t: string) => t.trim())
          .map((t: string) => (
            <span key={t} className="tag">
              #{t.trim().toUpperCase().replace(/\s/g, "")}
            </span>
          ))}
      </div>
    </article>
  );
}

export default function Portfolio({ works, t }: { works: any[]; t: any }) {
  const cats = Array.from(new Set(works.map((w) => w.category)));
  const [f, setF] = useState("");
  const list = f ? works.filter((w) => w.category === f) : works;
  if (!works.length) return <p className="glass muted">{t.empty}</p>;
  return (
    <>
      <div className="row" role="tablist">
        {["", ...cats].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={f === c}
            className={"btn ghost" + (f === c ? " act" : "")}
            onClick={() => setF(c)}
          >
            {c || t.allLabel}
          </button>
        ))}
      </div>
      <div className="grid reels">
        {list.map((w) => (
          <Card key={w.id} w={w} label={t.watchLabel} />
        ))}
      </div>
    </>
  );
}