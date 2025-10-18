import React, { useState } from "react";
import "./App.css";
import Entrypoint from "./entrypoint";
import LogsPanel from "./logs_section";
import RealTimeData from "./real_time_data";

function App() {
  const [userId, setUserId] = useState(null);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 10 }}>
      <div style={{ width: 360, paddingRight: 35/* left: real-time data box */ }}>
        <RealTimeData userId={userId} />
      </div>

      <div style={{ flex: 1 /* center: entrypoint */ }}>
        <Entrypoint onSuccess={setUserId} />
      </div>

      <div style={{ width: 380 /* right: logs */ }}>
        <LogsPanel userId={userId} />
      </div>
    </div>
  );
}

export default App;
