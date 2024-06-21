import React, { useContext } from "react";

import { useActor } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { PortalContext, PortalProvider } from "./lib/PortalProvider";
import { Ocean } from "features/world/ui/Ocean";
import { FarmerSoccerHud } from "./components/FarmerSoccerHud";
import { FarmerSoccerPhaser } from "./FarmerSoccerPhaser";
import { FarmerSoccerModals } from "./components/FarmerSoccerModals";
import { Label } from "components/ui/Label";
import { authorisePortal } from "features/portal/farmersoccer/lib/portalUtil";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { WalletProvider } from "features/wallet/WalletProvider";

export const FarmerSoccerApp: React.FC = () => {
  return (
    <WalletProvider>
      <PortalProvider>
        <Ocean>
          <FarmerSoccer />
        </Ocean>
      </PortalProvider>
    </WalletProvider>
  );
};

export const FarmerSoccer: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const { t } = useAppTranslation();
  return (
    <div>
      {portalState.matches("unauthorised") && (
        <Modal show>
          <Panel>
            <div className="p-2">
              <Label type="danger">{t("error")}</Label>
              <span className="text-sm my-2">{t("session.expired")}</span>
            </div>
            <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
          </Panel>
        </Modal>
      )}
      {portalState.context.state && (
        <>
          <FarmerSoccerHud />
          <FarmerSoccerPhaser />
          <FarmerSoccerModals />
        </>
      )}
    </div>
  );
};
