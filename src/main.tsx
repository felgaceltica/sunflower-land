import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { CONFIG } from "lib/config";
import { FarmerFootballApp } from "features/portal/farmerfootball/FarmerFootball";

// TODO - tree shaking to minimise bundle size
if (CONFIG.PORTAL_APP) {
  ReactDOM.render(
    <React.StrictMode>
      <FarmerFootballApp />
    </React.StrictMode>,
    document.getElementById("root")
  );
} else {
  // Main Game
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
