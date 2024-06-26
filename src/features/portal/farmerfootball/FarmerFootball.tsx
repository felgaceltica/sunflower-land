import React, { useContext } from "react";

import { useActor } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { PortalContext, PortalProvider } from "./lib/PortalProvider";
import { Ocean } from "features/world/ui/Ocean";
import { FarmerFootballHud } from "./components/FarmerFootballHud";
import { FarmerFootballPhaser } from "./FarmerFootballPhaser";
import { FarmerFootballModals } from "./components/FarmerFootballModals";
import { Label } from "components/ui/Label";
import { authorisePortal } from "features/portal/farmerfootball/lib/portalUtil";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { WalletProvider } from "features/wallet/WalletProvider";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";

export const FarmerFootballApp: React.FC = () => {
  return (
    <WalletProvider>
      <PortalProvider>
        <Ocean>
          <FarmerFootball />
        </Ocean>
      </PortalProvider>
    </WalletProvider>
  );
};

export const FarmerFootball: React.FC = () => {
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
      {portalState.matches("loading") && (
        <Modal show>
          <Panel>
            <Loading />
            <span className="text-xs">
              {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
            </span>
          </Panel>
        </Modal>
      )}

      {portalState.context.state && (
        <>
          <FarmerFootballHud />
          <FarmerFootballPhaser />
          <FarmerFootballModals />
        </>
      )}
    </div>
  );
};
