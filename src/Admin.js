import React, { useState, useEffect } from "react";
import { FaEye, FaSyncAlt } from "react-icons/fa";
import { Container, Row, Col, Table, Button, Card, Spinner, Alert } from "react-bootstrap";
import AdminDrawer from "./AdminDrawer";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

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

  // Fetch admin data
  const fetchAdminData = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/admin");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    fetch("http://127.0.0.1:8000/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.setItem("redirectAfterLogin", "/admin");
          navigate("/login");
          throw new Error("Unauthenticated");
        }
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

  const openDrawer = (requests, userId) => {
    setSelectedRequests(requests);
    setSelectedUserId(userId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRequests([]);
    setSelectedUserId("");
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">Admin Dashboard</h2>
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2"
            onClick={fetchAdminData}
            disabled={loading}
          >
            <FaSyncAlt /> Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <StatCard label="Total Users" value={stats.total_users} color="#2563eb" />
          </Col>
          <Col md={4}>
            <StatCard label="Total Requests" value={stats.total_requests} color="#059669" />
          </Col>
          <Col md={4}>
            <StatCard label="Unique IPs" value={stats.unique_ip_count} color="#d97706" />
          </Col>
        </Row>

        {/* Data Section */}
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-secondary">Loading admin data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white fw-semibold">
              Users Overview
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>User ID</th>
                    <th>Email</th>
                    <th>Total Requests</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>{user.email_address}</td>
                        <td>{user.requests?.length || 0}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openDrawer(user.requests || [], user.user_id)}
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        <AdminDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          requests={selectedRequests}
          userId={selectedUserId}
        />
      </Container>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <Card className="h-100 shadow-sm border-0 text-center">
      <Card.Body>
        <div className="fw-bold" style={{ fontSize: "2.2rem", color }}>
          {value}
        </div>
        <div className="text-secondary mt-2 fw-semibold">{label}</div>
      </Card.Body>
    </Card>
  );
}
