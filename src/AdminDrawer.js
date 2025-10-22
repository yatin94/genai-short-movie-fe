import React, { useState } from "react";
import { Offcanvas, Table, Button, Collapse, Badge } from "react-bootstrap";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import BgStatusDropdown from "./BgStatusDropdown";

export default function AdminDrawer({ open, onClose, requests, userId }) {
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const handleDropdownClick = (requestId) => {
    setDropdownOpenId(dropdownOpenId === requestId ? null : requestId);
  };

  return (
    <Offcanvas
      show={open}
      onHide={onClose}
      placement="end"
      backdrop={true}
      scroll={true}
      style={{ width: "75vw", maxWidth: 900 }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="text-primary fw-bold">
          User Requests
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {requests && requests.length > 0 ? (
          <Table striped bordered hover responsive className="align-middle">
            <thead className="table-primary">
              <tr>
                <th>Request ID</th>
                <th>IP</th>
                <th>Topic</th>
                <th>Created At</th>
                <th style={{ textAlign: "center" }}>BG Status</th>
              </tr>
            </thead>
            <tbody>
              {[...requests].reverse().map((r) => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td className="fw-medium">{r.id}</td>
                    <td>{r.ip}</td>
                    <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: 350 }}>
                      {r.topic}
                    </td>
                    <td>
                      <Badge bg="light" text="dark">
                        {r.created_at}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleDropdownClick(r.id)}
                        aria-label="Show BG Status"
                      >
                        {dropdownOpenId === r.id ? (
                          <FaChevronUp size={16} />
                        ) : (
                          <FaChevronDown size={16} />
                        )}
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-0 border-0">
                      <Collapse in={dropdownOpenId === r.id}>
                        <div className="bg-light p-3 border-top">
                          <BgStatusDropdown requestId={r.id} userId={userId} />
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center text-muted mt-4">
            <p>No user requests available.</p>
          </div>
        )}

        <div className="d-flex justify-content-end mt-3">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
