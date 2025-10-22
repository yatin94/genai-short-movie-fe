import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Spinner, Alert, Badge } from "react-bootstrap";

export default function BgStatusDropdown({ userId, requestId }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bgStatus, setBgStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
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
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch BG status");
        return res.json();
      })
      .then((data) => {
        setBgStatus(data.bg_status || "");
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading BG status");
        setLoading(false);
      });
  }, [requestId, userId, navigate]);

  return (
    <div className="d-flex justify-content-center mt-4">
      <Card className="shadow-sm w-100" style={{ maxWidth: 700 }}>
        <Card.Body>
          <Card.Title className="mb-3 text-primary fw-bold">
            Background Check Status
          </Card.Title>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <Spinner animation="border" variant="primary" />
              <span className="ms-2 text-primary">Loading BG status...</span>
            </div>
          ) : error ? (
            <Alert variant="danger" className="fw-semibold">
              {error}
            </Alert>
          ) : (
            <>
              <div className="mb-3">
                <strong>Flower Status: </strong>
                <Badge
                  bg={bgStatus === "SUCCESS" ? "success" : "warning"}
                  className="ms-2 px-3 py-2 text-uppercase"
                  style={{ fontSize: "0.85rem" }}
                >
                  {bgStatus || "N/A"}
                </Badge>
              </div>

              <div>
                <strong>Logs</strong>
                <div
                  className="mt-2 border rounded bg-light"
                  style={{
                    maxHeight: 320,
                    overflowY: "auto",
                  }}
                >
                  <Table striped hover responsive className="mb-0">
                    <thead className="table-primary sticky-top">
                      <tr>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log, idx) => (
                          <tr key={idx}>
                            <td>{log.asctime}</td>
                            <td>
                              <Badge
                                bg={
                                  log.levelname === "ERROR"
                                    ? "danger"
                                    : "info"
                                }
                              >
                                {log.levelname}
                              </Badge>
                            </td>
                            <td>{log.message}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center text-muted py-3">
                            No logs available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
