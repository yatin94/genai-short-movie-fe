import React, { useEffect, useRef, useState } from "react";

export default function LogsPanel({ userId, requestId }) {
  const [logs, setLogs] = useState([]); // array of {id, text, time, level}
  const [connected, setConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    // if no userId, ensure socket is closed and logs cleared
    if (!userId) {
      console.log("LogsPanel: no userId, closing socket and clearing logs");
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try {
        wsRef.current && wsRef.current.close();
      } catch (_) {
        console.log("LogsPanel: error closing websocket");
      }
      wsRef.current = null;
      setConnected(false);
      setAttempt(0);
      setLogs((s) => (s.length ? [] : s));
      return;
    }

    let mounted = true;

    const connect = () => {
      // use ws:// for local dev and attach user id as path
      const url = `ws://127.0.0.1:8000/logs/${encodeURIComponent(userId)}/${encodeURIComponent(requestId)}`;
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          setConnected(true);
          setAttempt(0);
        };

        ws.onmessage = (evt) => {
          if (!mounted) return;
          const raw = evt.data;
          let text = raw;
          let level = "info"; // 'success' | 'error' | 'info'

          try {
            const parsed = JSON.parse(raw);

            // prefer top-level "message" field and "status" for color/level
            if (parsed && typeof parsed === "object" && "message" in parsed) {
              text = String(parsed.message);
              level = parsed.status === "success" ? "success" : parsed.status ? "error" : "info";
            } else if (parsed && parsed.time && parsed.msg) {
              text = `[${parsed.time}] ${parsed.msg}`;
              level = "info";
            } else {
              // fall back to a compact string for objects that don't match above
              text = JSON.stringify(parsed);
            }
          } catch (e) {
            // not JSON, keep raw text
            text = raw;
          }

          const entry = {
            id: Date.now() + Math.random(),
            text,
            time: new Date().toISOString(),
            level,
          };
          setLogs((s) => [...s, entry]);
        };

        ws.onclose = () => {
          setConnected(false);
          if (!mounted) return;
          setConnected(false);
          // scheduleReconnect();
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch (_) {}
        };
      } catch (err) {
        // scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      setAttempt((a) => {
        const next = Math.min(a + 1, 6);
        const timeout = Math.min(1000 * 2 ** a, 30000);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => connect(), timeout);
        return next;
      });
    };

    // start connection for this userId
    connect();

    return () => {
      mounted = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try {
        wsRef.current && wsRef.current.close();
      } catch (_) {}
    };
  }, [userId, requestId]);

  // auto-scroll on new logs
  useEffect(() => {
    if (!autoScroll) return;
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [logs, autoScroll]);

  const clearLogs = () => setLogs([]);
  const toggleAuto = () => setAutoScroll((v) => !v);

  const styles = {
    wrapper: {
      width: 380,
      maxWidth: "38%",
      minWidth: 280,
      height: "70vh",
      borderRadius: 10,
      background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.04)",
      boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: "#e6eef8",
    },
    header: {
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderBottom: "1px solid rgba(255,255,255,0.02)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))",
    },
    title: { fontSize: 13, fontWeight: 600, margin: 0, color: "#cfe7ff" },
    statusDot: (on) => ({
      width: 10,
      height: 10,
      borderRadius: 999,
      background: on ? "#34d399" : "#f87171",
      boxShadow: on ? "0 6px 14px rgba(52,211,153,0.12)" : "0 6px 14px rgba(248,113,113,0.08)",
    }),
    actions: { marginLeft: "auto", display: "flex", gap: 8 },
    actionBtn: {
      padding: "6px 10px",
      borderRadius: 8,
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.04)",
      color: "#a7b3c9",
      cursor: "pointer",
      fontSize: 12,
    },
    container: {
      flex: 1,
      overflowY: "auto",
      padding: 12,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    entry: {
      fontFamily: "Menlo, monospace",
      fontSize: 12,
      lineHeight: "1.3",
      color: "#dbe9ff",
      padding: "8px 10px",
      borderRadius: 6,
      background: "rgba(8,12,20,0.45)",
      border: "1px solid rgba(255,255,255,0.02)",
      wordBreak: "break-word",
    },
    entrySuccess: {
      border: "1px solid rgba(34,197,94,0.12)",
      background: "rgba(34, 255, 0, 0.17)",
      color: "#cedad2bd",
    },
    entryError: {
      border: "1px solid rgba(239,68,68,0.12)",
      background: "rgba(239, 68, 68, 0.31)",
      color: "#cedad2bd",
    },
    footer: {
      padding: "8px 12px",
      borderTop: "1px solid rgba(255,255,255,0.02)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 12,
      color: "#9fb7d9",
    },
    smallMuted: { fontSize: 11, color: "#7f98b6" },
  };

  return (
    <div style={styles.wrapper} aria-live="polite" aria-label="Logs panel">
      <div style={styles.header}>
        <div style={styles.statusDot(connected)} aria-hidden="true" />
        <div style={styles.title}>Realtime Logs</div>

        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={toggleAuto}>
            {autoScroll ? "Auto-scroll: ON" : "Auto-scroll: OFF"}
          </button>
          <button
            style={styles.actionBtn}
            onClick={clearLogs}
            title="Clear logs"
            aria-label="Clear logs"
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={containerRef} style={styles.container}>
        {logs.length === 0 ? (
          <div style={{ ...styles.entry, opacity: 0.6 }}>
            {userId ? "Waiting for logs..." : "No user selected. Submit Entrypoint to start logs."}
          </div>
        ) : (
          logs.map((l) => {
            const levelStyle =
              l.level === "success"
                ? styles.entrySuccess
                : l.level === "error"
                ? styles.entryError
                : {};
            return (
              <div key={l.id} style={{ ...styles.entry, ...levelStyle }}>
                {l.text}
              </div>
            );
          })
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.smallMuted}>
          {connected
            ? `Connected (user: ${userId})`
            : userId
            ? "Disconnected — attempting reconnect"
            : "Not connected"}
        </div>
        <div style={{ marginLeft: "auto", color: "#7f98b6" }}>{logs.length} entries</div>
      </div>
    </div>
  );
}