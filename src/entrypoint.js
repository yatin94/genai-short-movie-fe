import React, { useState } from "react";
import axios from "axios";

export default function Entrypoint({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg: string }
  const [locked, setLocked] = useState(false); // lock inputs after successful submit

  const validateEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const call_axios_api = async (email, topic) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/movie",
        { email: email.trim(), topic: topic.trim() },
        { headers: { "Content-Type": "application/json" } }
      );
      // axios puts body in response.data
      setStatus({
        type: "success",
        msg: response.data?.message || "Request submitted successfully.",
      });
      // lock inputs and keep current values
      setLocked(true);

      // extract possible user id keys and notify parent
      const userId =
        response.data?.user_id || response.data?.userId || response.data?.id || null;
      const requestId = response.data?.request_id || response.data?.requestId || null;
      if (userId && typeof onSuccess === "function") {
        try {
          onSuccess(userId, requestId);
        } catch (err) {
          // ignore callback errors
          // (do not break UI)
        }
      }

      return response.data;
    } catch (error) {
      const msg =
        error?.response?.data?.message || error.message || "Network error.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setStatus(null);

    if (!validateEmail(email)) {
      setStatus({ type: "error", msg: "Please enter a valid email address." });
      return;
    }
    if (!topic.trim()) {
      setStatus({ type: "error", msg: "Please add a topic." });
      return;
    }

    setLoading(true);
    await call_axios_api(email, topic);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#0f172a 0%, #0b1220 100%)",
      padding: 24,
      fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: "#e6eef8",
    },
    card: {
      width: 520,
      maxWidth: "100%",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      borderRadius: 12,
      padding: 28,
      boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
      border: "1px solid rgba(255,255,255,0.04)",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    logo: {
      width: 44,
      height: 44,
      borderRadius: 10,
      background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      color: "#fff",
      fontSize: 18,
      boxShadow: "0 6px 18px rgba(124,58,237,0.18)",
    },
    title: {
      margin: 0,
      fontSize: 18,
      fontWeight: 600,
      color: "#e6eef8",
    },
    subtitle: {
      margin: 0,
      fontSize: 13,
      color: "#a7b3c9",
    },
    form: { marginTop: 18, display: "grid", gap: 12 },
    label: { fontSize: 13, color: "#cbd6ea", marginBottom: 6 },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 10,
      background: "rgba(8,12,20,0.6)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "#e6eef8",
      outline: "none",
      fontSize: 14,
      boxSizing: "border-box",
    },
    textarea: { minHeight: 110, resize: "vertical" },
    footer: { display: "flex", gap: 12, alignItems: "center", marginTop: 6 },
    button: {
      padding: "10px 16px",
      borderRadius: 10,
      background:
        "linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(6,182,212,1) 100%)",
      color: "#061024",
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      boxShadow: "0 8px 22px rgba(6,182,212,0.12)",
    },
    ghost: {
      padding: "9px 12px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.06)",
      background: "transparent",
      color: "#a7b3c9",
      cursor: "pointer",
    },
    status: {
      marginLeft: "auto",
      fontSize: 13,
      padding: "8px 12px",
      borderRadius: 8,
    },
    success: {
      background: "rgba(34,197,94,0.12)",
      color: "#9ef3b6",
      border: "1px solid rgba(34,197,94,0.12)",
    },
    error: {
      background: "rgba(239,68,68,0.08)",
      color: "#ffb3b3",
      border: "1px solid rgba(239,68,68,0.08)",
    },
    spinner: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.18)",
      borderTopColor: "white",
      animation: "spin 1s linear infinite",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.card} role="region" aria-labelledby="entrypoint-title">
        <div style={styles.header}>
          <div style={styles.logo}>GM</div>
          <div>
            <h2 id="entrypoint-title" style={styles.title}>
              Generate Short Movie
            </h2>
            <p style={styles.subtitle}>
              Enter your email and a topic. We'll generate a short movie idea and notify you.
            </p>
          </div>
        </div>

        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          <div>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                ...(locked ? { opacity: 0.7, cursor: "not-allowed" } : {}),
              }}
              placeholder="you@domain.com"
              required
              aria-required="true"
              disabled={locked}
            />
          </div>

          <div>
            <label style={styles.label} htmlFor="topic">
              Topic
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                ...styles.input,
                ...styles.textarea,
                ...(locked ? { opacity: 0.7, cursor: "not-allowed" } : {}),
              }}
              placeholder="e.g. Time-traveling musician in a neon city"
              required
              aria-required="true"
              disabled={locked}
            />
          </div>

          <div style={styles.footer}>
            <button
              type="submit"
              style={{ ...styles.button, opacity: loading ? 0.8 : 1 }}
              disabled={loading || locked}
              aria-disabled={loading || locked}
            >
              {loading ? (
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <span style={styles.spinner} aria-hidden="true" />
                  Sending...
                </span>
              ) : (
                "Submit"
              )}
            </button>

            <button
              type="button"
              style={styles.ghost}
              onClick={() => {
                setEmail("");
                setTopic("");
                setStatus(null);
                setLocked(false); // allow editing again
                if (typeof onSuccess === "function") {
                  // notify parent that user cleared (pass null)
                  try { onSuccess(null); } catch (_) {}
                }
              }}
            >
              Reset
            </button>

            {status && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  ...styles.status,
                  ...(status.type === "success" ? styles.success : styles.error),
                }}
              >
                {status.msg}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}