import React, { useEffect, useRef, useState } from "react";

export default function RealTimeData({ userId }) {
  const [story, setStory] = useState("");
  const [script, setScript] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const attemptsRef = useRef(0);

  // refs for per-section scrolling
  const storyRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // close when no userId
    if (!userId) {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try { wsRef.current && wsRef.current.close(); } catch (_) {}
      wsRef.current = null;
      attemptsRef.current = 0;
      setConnected(false);
      setStory("");
      setScript("");
      return;
    }

    let mounted = true;

    const connect = () => {
      const url = `ws://127.0.0.1:8000/data/${encodeURIComponent(userId)}`;
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          setConnected(true);
          attemptsRef.current = 0;
        };

        ws.onmessage = (evt) => {
          if (!mounted) return;
          let payload = evt.data;
          try {
            const parsed = JSON.parse(evt.data);
            // prefer explicit fields
            if (parsed && typeof parsed === "object") {
              if ("story" in parsed)
                setStory((prev) =>
                  prev ? prev + "\n\n" + String(parsed.story || "") : String(parsed.story || "")
                );
              // append script chunks so multiple script messages accumulate
              if ("script" in parsed)
                setScript((prev) =>
                  prev ? prev + "\n\n" + String(parsed.script || "") : String(parsed.script || "")
                );
               // allow older format: {message, status} -> append to story
               if (!("story" in parsed) && !("script" in parsed) && "message" in parsed) {
                 setStory((s) => (s ? s + "\n\n" + parsed.message : String(parsed.message)));
               }
               return;
             }
          } catch (e) {
            // not JSON -> treat as additional story text
            payload = evt.data;
          }
          // fallback: append raw to story
          setStory((s) => (s ? s + "\n\n" + payload : payload));
        };

        ws.onclose = () => {
          if (!mounted) return;
          setConnected(false);
          scheduleReconnect();
        };

        ws.onerror = () => {
          try { ws.close(); } catch (_) {}
        };
      } catch (err) {
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      attemptsRef.current = Math.min(attemptsRef.current + 1, 6);
      const timeout = Math.min(1000 * 2 ** (attemptsRef.current - 1 || 0), 30000);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(() => {
        if (!mounted) return;
        connect();
      }, timeout);
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try { wsRef.current && wsRef.current.close(); } catch (_) {}
    };
  }, [userId]);

  // auto-scroll story when it updates
  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [story]);

  // auto-scroll script when it updates
  useEffect(() => {
    const el = scriptRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [script]);

  const clear = () => {
    setStory("");
    setScript("");
  };

  const styles = {
    // limit the overall component to viewport height so main page doesn't scroll
    box: {
      width: 520,
      maxWidth: "100%",
      // ensure the component never exceeds viewport height minus some padding/header
      maxHeight: "calc(100vh - 120px)",
      borderRadius: 10,
      padding: 18,
      background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.04)",
      boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
      color: "#e6eef8",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
      overflow: "hidden", // prevent the box from scrolling the page
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderBottom: "1px solid rgba(255,255,255,0.02)",
      paddingBottom: 8,
    },
    title: { fontSize: 16, fontWeight: 700, margin: 0, color: "#cfe7ff" },
    statusDot: (on) => ({
      width: 10,
      height: 10,
      borderRadius: 999,
      background: on ? "#34d399" : "#f87171",
    }),
    contentWrap: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      minHeight: 0, // allow children to shrink and enable inner scrolling
    },
    // story smaller than script
    storySection: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      flex: "0 1 30%", // take ~30% of available height
      minHeight: 80,
      maxHeight: "40%", // relative to box
      minWidth: 0,
    },
    scriptSection: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      flex: "1 1 70%", // take remaining (~70%) of available height
      minHeight: 120,
      maxHeight: "70%",
      minWidth: 0,
    },
    // scrolling areas inside each section
    scrollArea: {
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      padding: 10,
      borderRadius: 6,
      background: "rgba(0,0,0,0.15)",
      border: "1px solid rgba(255,255,255,0.02)",
      boxSizing: "border-box",
    },
    sectionTitle: { fontSize: 14, fontWeight: 600, color: "#a7c8ff" },
    pre: {
      whiteSpace: "pre-wrap",
      fontFamily: "Menlo, monospace",
      fontSize: 13,
      lineHeight: 1.45,
      color: "#d8dfe7ff",
      margin: 0,
    },
    footer: { display: "flex", gap: 8, alignItems: "center" },
    btn: {
      padding: "8px 10px",
      borderRadius: 8,
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.04)",
      color: "#a7b3c9",
      cursor: "pointer",
      fontSize: 13,
    },
  };

  return (
    <div style={styles.box} aria-live="polite" aria-label="Realtime story and script">
      <div style={styles.header}>
        <div style={styles.statusDot(connected)} aria-hidden="true" />
        <div style={styles.title}>Realtime Story & Script</div>
        <div style={{ marginLeft: "auto", color: "#9fb7d9", fontSize: 9 }}>
          {connected ? `connected (user: ${userId})` : userId ? "connecting..." : "waiting for user"}
        </div>
        <button style={styles.btn} onClick={clear} title="Clear">Clear</button>
      </div>

      <div style={styles.contentWrap}>
        <div style={styles.storySection}>
          <div style={styles.sectionTitle}>Story</div>
          <div ref={storyRef} style={styles.scrollArea}>
            <pre style={styles.pre}>{story || (userId ? "Waiting for story..." : "No user selected")}</pre>
          </div>
        </div>

        <div style={styles.scriptSection}>
          <div style={styles.sectionTitle}>Script</div>
          <div ref={scriptRef} style={styles.scrollArea}>
            <pre style={styles.pre}>{script || (userId ? "Waiting for script..." : "No user selected")}</pre>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={{ color: "#7f98b6", fontSize: 12, marginLeft: "auto" }}>
          {story || script ? "Generated content shown above" : ""}
        </div>
      </div>
    </div>
  );
}