import React, { useState, useEffect } from "react";
import { FaEye, FaSyncAlt } from "react-icons/fa";
import AdminDrawer from "./AdminDrawer";

export default function Admin() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_requests: 0,
    unique_ip_count: 0,
  });

  // Refetch logic
  const fetchAdminData = () => {
    setLoading(true);
    setError("");
    fetch("http://127.0.0.1:8000/admin")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch admin data");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setStats({
          total_users: data.total_users || 0,
          total_requests: data.total_requests || 0,
          unique_ip_count: data.unique_ip_count || 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading admin data");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update openDrawer to accept userId
  const openDrawer = (requests, userId) => {
    setSelectedRequests(requests);
    setSelectedUserId(userId); // Store userId
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRequests([]);
    setSelectedUserId("");
  };

  return (
    <div style={{ color: "#fff", padding: 40, background: "#f5f7fa", minHeight: "100vh" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24
      }}>
        <h2 style={{ color: "#222" }}>Admin Page</h2>
        <button
          onClick={fetchAdminData}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: 16,
            gap: 8
          }}
          title="Refresh"
          aria-label="Refresh admin data"
          disabled={loading}
        >
          <FaSyncAlt size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div style={{
        display: "flex",
        gap: 32,
        marginBottom: 32,
        justifyContent: "center"
      }}>
        <StatCard label="Total Users" value={stats.total_users} color="#2563eb" />
        <StatCard label="Total Requests" value={stats.total_requests} color="#059669" />
        <StatCard label="Unique IPs" value={stats.unique_ip_count} color="#d97706" />
      </div>

      {loading ? (
        <div style={{ color: "#222", textAlign: "center", marginTop: 40 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>{error}</div>
      ) : (
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          padding: 24,
          maxWidth: 900,
          margin: "0 auto"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
            <thead>
              <tr style={{ background: "#eaf1fb" }}>
                <th style={thStyle}>User ID</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Total Requests</th>
                <th style={thStyle}>View</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{user.user_id}</td>
                  <td style={tdStyle}>{user.email_address}</td>
                  <td style={tdStyle}>{user.requests?.length || 0}</td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 6,
                      }}
                      onClick={() => openDrawer(user.requests || [], user.user_id)} // Pass userId here
                      aria-label="View requests"
                    >
                      <FaEye color="#2563eb" size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        requests={selectedRequests}
        userId={selectedUserId} // Pass userId as prop
      />
    </div>
  );
}

// StatCard component for displaying stats
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
      padding: "24px 32px",
      minWidth: 160,
      textAlign: "center",
      borderLeft: `6px solid ${color}`,
      color: "#222"
    }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 16, marginTop: 8 }}>{label}</div>
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