import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Entrypoint from "./entrypoint";
import LogsPanel from "./logs_section";
import RealTimeData from "./real_time_data";
import Admin from "./Admin";
import Login from "./Login";

function MainApp() {
  const [userId, setUserId] = useState(null);
  const [requestId, setRequestId] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: 10,
        height: "100vh",
        overflow: "hidden",
        boxSizing: "border-box",
        background: "#060b17",
      }}
    >
      <div style={{ width: 360, paddingRight: 35 }}>
        <RealTimeData userId={userId} requestId={requestId} />
      </div>
      <div style={{ flex: 1 }}>
        <Entrypoint onSuccess={(userId, requestId) => {
          setUserId(userId);
          setRequestId(requestId);
        }} />
      </div>
      <div style={{ width: 280 }}>
        <LogsPanel userId={userId} requestId={requestId} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}
