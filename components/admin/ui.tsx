"use client";

import { createContext, useContext, useState } from "react";
import { uploadPresigned } from "@vercel/blob/client";

export const Ctx = createContext<any>(null);

export const useCms = () => useContext(Ctx);

export const get = (o: any, p: string) =>
  p.split(".").reduce((a, k) => a?.[k], o);

export function setIn(o: any, p: string[], v: any): any {
  const [k, ...r] = p;
  const c = Array.isArray(o) ? [...o] : { ...o };
  c[k] = r.length ? setIn(o?.[k], r, v) : v;
  return c;
}

export function F({
  p,
  label,
  area,
  type = "text",
}: {
  p: string;
  label: string;
  area?: boolean;
  type?: string;
}) {
  const { c, set } = useCms();
  const P = {
    value: get(c, p) ?? "",
    onChange: (e: any) => set(p, e.target.value),
  };
  return (
    <label>
      {label}
      {area ? <textarea rows={4} {...P} /> : <input type={type} {...P} />}
    </label>
  );
}

export function Chk({ p, label }: { p: string; label: string }) {
  const { c, set } = useCms();
  return (
    <label className="row">
      <input
        type="checkbox"
        style={{ width: "auto" }}
        checked={!!get(c, p)}
        onChange={(e) => set(p, e.target.checked)}
      />
      {label}
    </label>
  );
}

export function Sel({
  p,
  label,
  opts,
}: {
  p: string;
  label: string;
  opts: string[];
}) {
  const { c, set } = useCms();
  return (
    <label>
      {label}
      <select value={get(c, p) ?? ""} onChange={(e) => set(p, e.target.value)}>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -------------------------------------------------------
   MEDIA UPLOAD (direct browser -> Vercel Blob, presigned)
   ------------------------------------------------------- */

export function Media({
  p,
  label,
  kind,
}: {
  p: string;
  label: string;
  kind: "image" | "video";
}) {
  const { c, set, toast } = useCms();
  const v = get(c, p);
  const [pr, setPr] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    setPr("Uploading 0%");
    try {
      const blob = await uploadPresigned(`${kind}s/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        multipart: true,
        onUploadProgress: (e: any) =>
          setPr(`Uploading ${Math.round(e.percentage)}%`),
      });
      set(p, blob.url);
      toast("Uploaded successfully. Click Save & Publish.");
    } catch (e: any) {
      console.error("MEDIA UPLOAD ERROR:", e);
      toast("Failed to upload: " + (e?.message || "Please try again."), true);
    } finally {
      setPr("");
    }
  }

  function remove() {
    if (!confirm("Remove this file?")) return;
    set(p, "");
  }

  return (
    <div className="media">
      <span>{label}</span>

      {v &&
        (kind === "image" ? (
          <img src={v} alt="" className="thumb" />
        ) : (
          <video src={v} className="thumb" controls muted preload="metadata" />
        ))}

      <div className="row">
        <input
          type="file"
          accept={
            kind === "image"
              ? "image/jpeg,image/png,image/webp"
              : "video/mp4,video/webm,video/quicktime"
          }
          onChange={(e) => pick(e.target.files?.[0])}
          disabled={!!pr}
        />
        {v && (
          <button
            type="button"
            className="btn ghost"
            onClick={remove}
            disabled={!!pr}
          >
            Remove
          </button>
        )}
      </div>

      {pr && <small>{pr}</small>}
    </div>
  );
}

/* -------------------------------------------------------
   LIST EDITOR
   ------------------------------------------------------- */

export function List({
  p,
  make,
  title,
  children,
}: {
  p: string;
  make: () => any;
  title: (i: any) => string;
  children: (b: string) => React.ReactNode;
}) {
  const { c, set } = useCms();
  const list: any[] = get(c, p) || [];

  const mv = (i: number, d: number) => {
    const a = [...list];
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    set(p, a);
  };

  return (
    <>
      {list.map((it, i) => (
        <details key={it.id || i} className="glass">
          <summary>{title(it)}</summary>

          {children(`${p}.${i}`)}

          <div className="row">
            <button type="button" className="btn ghost" onClick={() => mv(i, -1)}>
              ↑ Up
            </button>
            <button type="button" className="btn ghost" onClick={() => mv(i, 1)}>
              ↓ Down
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                confirm("Delete this item?") &&
                set(p, list.filter((_, k) => k !== i))
              }
            >
              Delete
            </button>
          </div>
        </details>
      ))}

      <button
        type="button"
        className="btn"
        onClick={() => set(p, [...list, { id: crypto.randomUUID(), ...make() }])}
      >
        + Add
      </button>
    </>
  );
}