import React from "react";

import { FruitDashApp } from "./fruitdash/FruitDash";
import { CONFIG } from "lib/config";
import { FarmerFootballApp } from "./farmerfootball/FarmerFootball";
import { IrrigateApp } from "./irrigate/Irrigate";

export const PortalApp: React.FC = () => {
  switch (CONFIG.PORTAL_APP) {
    case "irrigate":
      return <IrrigateApp />;
    case "fruit-dash":
      return <FruitDashApp />;
    case "farmer-football":
      return <FarmerFootballApp />;
    default:
      return <FruitDashApp />;
  }
};
