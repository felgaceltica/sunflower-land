import React, { useContext, useEffect, useState } from "react";

import { useSelector } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { PortalContext, PortalProvider } from "./lib/PortalProvider";
import { WalletProvider } from "features/wallet/WalletProvider";
import { FruitDashHud } from "./components/hud/FruitDashHud";
import { FruitDashPhaser } from "./FruitDashPhaser";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "./lib/FruitDashMachine";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";
import { authorisePortal, claimPrize } from "../lib/portalUtil";
import { FruitDashRulesPanel } from "./components/panels/FruitDashRulesPanel";
import { FruitDashNoAttemptsPanel } from "./components/panels/FruitDashNoAttemptsPanel";
import AchievementToastProvider from "./providers/AchievementToastProvider";
import { SpeakingModal } from "features/game/components/SpeakingModal";
import { translate } from "lib/i18n/translate";
import {
  FRUIT_DASH_NPC_NAME,
  FRUIT_DASH_NPC_WEREABLES,
} from "./util/FruitDashConstants";
import { hasFeatureAccess } from "lib/flags";
import { OFFLINE_FARM } from "features/game/lib/landData";
import { useIsHalloweenMode } from "./util/useIsHalloweenMode";

const _sflBalance = (state: PortalMachineState) => state.context.state?.balance;
const _isError = (state: PortalMachineState) => state.matches("error");
const _isUnauthorised = (state: PortalMachineState) =>
  state.matches("unauthorised");
const _isLoading = (state: PortalMachineState) => state.matches("loading");
const _isNoAttempts = (state: PortalMachineState) =>
  state.matches("noAttempts");
const _isIntroduction = (state: PortalMachineState) =>
  state.matches("introduction");
const _isLoser = (state: PortalMachineState) => state.matches("loser");
const _isWinner = (state: PortalMachineState) => state.matches("winner");
const _isComplete = (state: PortalMachineState) => state.matches("complete");
const _EntranceMessageMaxDate = new Date("2025-05-25T00:00:00Z");
const _EntranceMessage = "fruit-dash.entrancemessage_2";
const _timedEventName = "fruit-dash.easterEvent";
const _isReadEntranceMessage = hasReadFruitEntranceMessage();
const _isReadTimedEventMessage = hasReadFruitDashTimedEventMessage();

export function hasReadFruitDashTimedEventMessage() {
  if (hasFeatureAccess(OFFLINE_FARM, "FRUIT_DASH_TIMED_EVENT"))
    return !!localStorage.getItem(_timedEventName);
  else return true;
}
export function hasReadFruitEntranceMessage() {
  if (Date.now() > _EntranceMessageMaxDate.getTime()) return true;

  return !!localStorage.getItem(_EntranceMessage);
}

function acknowledgeFruitEntranceMessage() {
  return localStorage.setItem(_EntranceMessage, new Date().toISOString());
}

function acknowledgeFruitDashTimedEventMessage() {
  return localStorage.setItem(_timedEventName, new Date().toISOString());
}

export const FruitDashApp: React.FC = () => {
  return (
    <WalletProvider>
      <PortalProvider>
        <FruitDash />
      </PortalProvider>
    </WalletProvider>
  );
};
const _state = (state: PortalMachineState) => state.context.state;

export const FruitDash: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const state = useSelector(portalService, _state);
  const { changeHalloweenMode } = useIsHalloweenMode();
  const { t } = useAppTranslation();
  const [isReadEntranceMessage, setIsReadEntranceMessage] = useState(
    _isReadEntranceMessage,
  );
  const [isReadTimedEventMessage, setIsReadTimedEventMessage] = useState(
    _isReadTimedEventMessage,
  );
  const sflBalance = useSelector(portalService, _sflBalance);
  const isError = useSelector(portalService, _isError);
  const isUnauthorised = useSelector(portalService, _isUnauthorised);
  const isLoading = useSelector(portalService, _isLoading);
  const isNoAttempts = useSelector(portalService, _isNoAttempts);
  const isIntroduction = useSelector(portalService, _isIntroduction);
  const isWinner = useSelector(portalService, _isWinner);
  const isLoser = useSelector(portalService, _isLoser);
  const isComplete = useSelector(portalService, _isComplete);

  //const isReadHalloweenEvent = useSelector(portalService, _isReadHalloweenEvent);
  useEffect(() => {
    // If a player tries to quit while playing, mark it as an attempt
    const handleBeforeUnload = () => {
      portalService.send("GAME_OVER");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (isError) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("error.wentWrong")}</span>
          </div>
          <Button onClick={() => portalService.send("RETRY")}>
            {t("retry")}
          </Button>
        </Panel>
      </Modal>
    );
  }

  if (isUnauthorised) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("session.expired")}</span>
          </div>
          <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
        </Panel>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <Modal show>
        <Panel>
          <Loading />
          <span className="text-xs">
            {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
          </span>
        </Panel>
      </Modal>
    );
  }
  return (
    <div>
      {isNoAttempts && (
        <Modal show>
          <FruitDashNoAttemptsPanel />
        </Modal>
      )}
      {isIntroduction && !isReadEntranceMessage && (
        <Modal show>
          <SpeakingModal
            bumpkinParts={FRUIT_DASH_NPC_WEREABLES[FRUIT_DASH_NPC_NAME]}
            message={[
              {
                text: translate(_EntranceMessage),
                actions: [
                  {
                    text: translate("ok"),
                    cb: () => {
                      setIsReadEntranceMessage(true);
                      acknowledgeFruitEntranceMessage();
                    },
                  },
                ],
              },
            ]}
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </Modal>
      )}
      {isIntroduction && !isReadTimedEventMessage && (
        <Modal show>
          <SpeakingModal
            bumpkinParts={FRUIT_DASH_NPC_WEREABLES[FRUIT_DASH_NPC_NAME]}
            message={[
              {
                text: translate(_timedEventName),
                actions: [
                  {
                    text: translate("ok"),
                    cb: () => {
                      changeHalloweenMode(false);
                      setIsReadTimedEventMessage(true);
                      acknowledgeFruitDashTimedEventMessage();
                      PubSub.publish("restartScene");
                    },
                  },
                ],
              },
            ]}
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </Modal>
      )}
      {isIntroduction && isReadEntranceMessage && isReadTimedEventMessage && (
        <Modal show>
          <FruitDashRulesPanel
            mode={"introduction"}
            showScore={false}
            showExitButton={true}
            confirmButtonText={t("start")}
            onConfirm={() => portalService.send("CONTINUE")}
          />
        </Modal>
      )}

      {isLoser && (
        <Modal show>
          <FruitDashRulesPanel
            mode={"failed"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={t("play.again")}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {isWinner && (
        <Modal show>
          <FruitDashRulesPanel
            mode={"success"}
            showScore={true}
            showExitButton={false}
            confirmButtonText={t("claim")}
            onConfirm={claimPrize}
          />
        </Modal>
      )}

      {isComplete && (
        <Modal show>
          <FruitDashRulesPanel
            mode={"introduction"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={t("play.again")}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {sflBalance && (
        <AchievementToastProvider>
          <FruitDashHud />
          <FruitDashPhaser />
        </AchievementToastProvider>
      )}
    </div>
  );
};
