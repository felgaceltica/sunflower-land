import React from "react";

import { FruitDashApp } from "./fruitdash/FruitDash";
import { CONFIG } from "lib/config";
import { FarmerFootballApp } from "./farmerfootball/FarmerFootball";
import { IrrigateApp } from "./irrigate/Irrigate";
import { WhackAMoleApp } from "./whackamole/WhackAMole";
import { PortalExample } from "./example/PortalExample";

export const PortalApp: React.FC = () => {
  switch (CONFIG.PORTAL_APP) {
    case "irrigate":
      return <IrrigateApp />;
    case "fruit-dash":
      return <FruitDashApp />;
    case "minewhack":
      return <WhackAMoleApp />;
    case "farmer-football":
      return <FarmerFootballApp />;
    default:
      return <PortalExample />;
  }
};
