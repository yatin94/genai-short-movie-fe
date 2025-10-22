import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import BgStatusDropdown from "./BgStatusDropdown";

export default function AdminDrawer({ open, onClose, requests, userId }) {
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  if (!open) return null;

  const handleDropdownClick = (requestId) => {
    setDropdownOpenId(dropdownOpenId === requestId ? null : requestId);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "80%",
      height: "100vh",
      background: "#fff",
      boxShadow: "-2px 0 16px rgba(0,0,0,0.12)",
      zIndex: 1000,
      padding: 40,
      overflowY: "auto",
      transition: "right 0.3s",
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "6px 12px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Close
      </button>
      <h3 style={{ color: "#2563eb", marginBottom: 18 }}>User Requests</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
        <thead>
          <tr style={{ background: "#eaf1fb" }}>
            <th style={thStyle}>Request ID</th>
            <th style={thStyle}>IP</th>
            <th style={thStyle}>Topic</th>
            <th style={thStyle}>Created At</th>
            <th style={thStyle}>BG Status</th>
          </tr>
        </thead>
        <tbody>
          {[...requests].reverse().map(r => (
            <React.Fragment key={r.id}>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{r.id}</td>
                <td style={tdStyle}>{r.ip}</td>
                <td style={{ ...tdStyle, whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 350 }}>
                  {r.topic}
                </td>
                <td style={tdStyle}>{r.created_at}</td>
                <td style={tdStyle}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                    }}
                    onClick={() => handleDropdownClick(r.id)}
                    aria-label="Show BG Status"
                  >
                    <FaChevronDown color="#2563eb" size={20} />
                  </button>
                </td>
              </tr>
              {dropdownOpenId === r.id && (
                <tr>
                  <td colSpan={5} style={{ background: "#f1f5f9", padding: 0 }}>
                    <BgStatusDropdown requestId={r.id} userId={userId} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  color: "#2563eb",
  fontWeight: 600,
  borderBottom: "2px solid #dbeafe"
};

const tdStyle = {
  padding: "10px 8px",
  color: "#222"
};