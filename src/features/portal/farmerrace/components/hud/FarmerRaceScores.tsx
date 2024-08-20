import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/FarmerRaceMachine";

const _score = (state: PortalMachineState) => state.context.score;

export const FarmerRaceScores: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const score = useSelector(portalService, _score);

  return (
    <>
      <div className="relative">
        <div className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse" />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "250px",
            paddingTop: "7px",
            paddingLeft: "3px",
          }}
        >
          <span>
            {t("farmer-race.score", {
              score: score,
            })}
          </span>
        </div>
      </div>
    </>
  );
};