"use client";

import { useState } from "react";

export default function Contact({
  c,
  services,
  wa,
  phone,
  socials,
}: any) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setErr("");
    setOk(false);

    const form = e.currentTarget;
    const f = new FormData(form);

    const data = {
      name: String(f.get("name") || ""),
      email: String(f.get("email") || ""),
      service: String(f.get("service") || ""),
      message: String(f.get("message") || ""),
      website: String(f.get("website") || ""),
    };

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await r.json().catch(() => ({}));

      if (r.ok) {
        setOk(true);
        form.reset();
      } else {
        setErr(result.error || "Please try again.");
      }
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="contact">
      {/* LEFT SIDE */}
      <div>
        <h2>{c.heading}</h2>

        <p className="muted">{c.desc}</p>

        {/* EMAIL */}
        <a
          className="glass info"
          href={`mailto:${c.email}`}
        >
          <span aria-hidden="true">✉️</span>

          <span>
            <small>Email</small>
            <br />
            {c.email}
          </span>
        </a>

        {/* WHATSAPP */}
        <a
          className="glass info"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">📞</span>

          <span>
            <small>WhatsApp / Phone</small>
            <br />
            {phone}
          </span>
        </a>

        {/* LOCATION */}
        <div className="glass info">
          <span aria-hidden="true">📍</span>

          <span>
            <small>Location</small>
            <br />
            {c.location}
          </span>
        </div>

        {/* SOCIAL LINKS */}
        <div className="row">
          {Array.isArray(socials) &&
            socials.map((s: any) => (
              <a
                key={s.id || s.platform}
                className="soc"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
              >
                {String(s.platform || "").slice(0, 2)}
              </a>
            ))}
        </div>

        {/* CONTACT CTA BUTTONS */}
        <div className="row">
          <a
            className="btn"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.waCta}
          </a>

          <a
            className="btn ghost"
            href={`mailto:${c.email}`}
          >
            {c.emailCta}
          </a>
        </div>
      </div>

      {/* RIGHT SIDE - CONTACT FORM */}
      {ok ? (
        <div
          className="glass"
          role="status"
          aria-live="polite"
        >
          <h3>{c.success}</h3>

          <button
            type="button"
            className="btn"
            onClick={() => setOk(false)}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form
          onSubmit={send}
          className="glass"
        >
          <h3>{c.formHeading}</h3>

          {/* NAME */}
          <label>
            {c.lName}

            <input
              name="name"
              required
              maxLength={80}
              autoComplete="name"
            />
          </label>

          {/* EMAIL */}
          <label>
            {c.lEmail}

            <input
              name="email"
              type="email"
              required
              maxLength={120}
              autoComplete="email"
            />
          </label>

          {/* SERVICE */}
          <label>
            {c.lService}

            <select
              name="service"
              defaultValue=""
              required
            >
              <option value="">
                {c.servicePlaceholder}
              </option>

              {Array.isArray(services) &&
                services.map((s: string) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                ))}
            </select>
          </label>

          {/* MESSAGE */}
          <label>
            {c.lMsg}

            <textarea
              name="message"
              required
              rows={5}
              maxLength={2000}
            />
          </label>

          {/* HONEYPOT / BOT PROTECTION */}
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none",
            }}
          />

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn big"
            disabled={busy}
          >
            {busy ? "Sending…" : c.submit}
          </button>

          {/* ERROR */}
          {err && (
            <p
              role="alert"
              aria-live="assertive"
            >
              {err}
            </p>
          )}
        </form>
      )}
    </div>
  );
}