import React from "react";

import { PortalProvider } from "./farmerrace/lib/PortalProvider";

import { WalletProvider } from "features/wallet/WalletProvider";
import { FarmerRace } from "./farmerrace/FarmerRace";

export const PortalApp: React.FC = () => {
  return (
    // WalletProvider - if you need to connect to a players wallet
    <WalletProvider>
      {/* PortalProvider - gives you access to a xstate machine which handles state management */}
      <PortalProvider>
        <FarmerRace />
      </PortalProvider>
    </WalletProvider>
  );
};
