import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BgStatusDropdown({ userId, requestId }) {
  const navigate = useNavigate(); // 👈 add this

  const [loading, setLoading] = useState(true);
  const [bgStatus, setBgStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // No token → go to login
      localStorage.setItem("redirectAfterLogin", "/admin");
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    fetch(`http://127.0.0.1:8000/bgstatus/${userId}/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },})
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch BG status");
        return res.json();
      })
      .then(data => {
        setBgStatus(data.bg_status || "");
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Error loading BG status");
        setLoading(false);
      });
  }, [requestId, userId]);

  return (
    <div style={{ padding: 24 }}>
      {loading ? (
        <div style={{ color: "#2563eb" }}>Loading BG status...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: "black" }}>Flower Status:</strong>{" "}
            <span style={{
              color: bgStatus === "SUCCESS" ? "#059669" : "#d97706",
              fontWeight: 600
            }}>
              {bgStatus}
            </span>
          </div>
          <div>
            <strong style={{ color: "black" }}>Logs:</strong>
            <div style={{
              maxHeight: 320,
              overflowY: "auto",
              marginTop: 8,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "#f9fafb"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "#eaf1fb", zIndex: 1 }}>
                  <tr>
                    <th style={logThStyle}>Timestamp</th>
                    <th style={logThStyle}>Status</th>
                    <th style={logThStyle}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={logTdStyle}>{log.asctime}</td>
                      <td style={{
                        ...logTdStyle,
                        color: log.levelname === "ERROR" ? "#dc2626" : "#2563eb",
                        fontWeight: 600
                      }}>{log.levelname}</td>
                      <td style={logTdStyle}>{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const logThStyle = {
  padding: "8px 6px",
  textAlign: "left",
  color: "#2563eb",
  fontWeight: 600,
  borderBottom: "2px solid #dbeafe"
};

const logTdStyle = {
  padding: "8px 6px",
  color: "#222"
};