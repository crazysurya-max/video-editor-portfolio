
"use client";

import { createContext, useContext, useState } from "react";

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
      <select
        value={get(c, p) ?? ""}
        onChange={(e) => set(p, e.target.value)}
      >
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
   MEDIA UPLOAD (signed browser upload -> Cloudinary)
   The Cloudinary API secret stays on the server.
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

    const allowedTypes =
      kind === "image"
        ? ["image/jpeg", "image/png", "image/webp"]
        : ["video/mp4", "video/webm", "video/quicktime"];

    if (!allowedTypes.includes(file.type)) {
      toast("Unsupported file type.", true);
      return;
    }

    // Prevent unexpectedly large files from being sent.
    const maxSize = 500 * 1024 * 1024;

    if (file.size > maxSize) {
      toast("File is too large. Maximum size is 500 MB.", true);
      return;
    }

    setPr("Preparing upload…");

    try {
      // The server verifies the admin session and signs the upload.
      const authResponse = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const auth = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(auth.error || "Could not authorize upload.");
      }

      if (
        !auth.cloudName ||
        !auth.apiKey ||
        !auth.signature ||
        !auth.timestamp ||
        !auth.folder
      ) {
        throw new Error("Upload configuration is incomplete.");
      }

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", auth.apiKey);
      form.append("timestamp", String(auth.timestamp));
      form.append("folder", auth.folder);
      form.append("signature", auth.signature);

      const resourceType = kind === "video" ? "video" : "image";

      const endpoint =
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          auth.cloudName
        )}/${resourceType}/upload`;

      setPr("Uploading 0%");

      const result: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", endpoint);
        xhr.responseType = "text";

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round(
              (event.loaded / event.total) * 100
            );

            setPr(`Uploading ${percentage}%`);
          }
        };

        xhr.onload = () => {
          let data: any;

          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            reject(new Error("Cloudinary returned an invalid response."));
            return;
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(
              new Error(
                data?.error?.message || "Cloudinary upload failed."
              )
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload."));
        };

        xhr.onabort = () => {
          reject(new Error("Upload cancelled."));
        };

        xhr.send(form);
      });

      if (!result.secure_url) {
        throw new Error("Cloudinary did not return a media URL.");
      }

      // Store the resulting URL in the CMS state.
      set(p, result.secure_url);

      toast("Uploaded successfully. Click Save & Publish.");
    } catch (e: any) {
      console.error("MEDIA UPLOAD ERROR:", e);

      toast(
        "Failed to upload: " +
          (e?.message || "Please try again."),
        true
      );
    } finally {
      setPr("");
    }
  }

  function remove() {
    if (!confirm("Remove this file from the CMS field?")) return;

    // Removes the URL from the CMS field, not the Cloudinary asset itself.
    set(p, "");
  }

  return (
    <div className="media">
      <span>{label}</span>

      {v &&
        (kind === "image" ? (
          <img src={v} alt="" className="thumb" />
        ) : (
          <video
            src={v}
            className="thumb"
            controls
            muted
            preload="metadata"
          />
        ))}

      <div className="row">
        <input
          type="file"
          accept={
            kind === "image"
              ? "image/jpeg,image/png,image/webp"
              : "video/mp4,video/webm,video/quicktime"
          }
          onChange={(e) => {
            const file = e.target.files?.[0];

            // Allows selecting the same file again after an upload.
            e.target.value = "";

            if (file) void pick(file);
          }}
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
            <button
              type="button"
              className="btn ghost"
              onClick={() => mv(i, -1)}
            >
              ↑ Up
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={() => mv(i, 1)}
            >
              ↓ Down
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                confirm("Delete this item?") &&
                set(
                  p,
                  list.filter((_, k) => k !== i)
                )
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
        onClick={() =>
          set(p, [...list, { id: crypto.randomUUID(), ...make() }])
        }
      >
        + Add
      </button>
    </>
  );
}
