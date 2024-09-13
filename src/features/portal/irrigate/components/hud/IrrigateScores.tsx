import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/IrrigateMachine";

// const _score = (state: PortalMachineState) => state.context.score;
const _movesLeft = (state: PortalMachineState) => state.context.movesLeft;

export const IrrigateScores: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  // const score = useSelector(portalService, _score);
  const movesLeft = useSelector(portalService, _movesLeft);

  return (
    <>
      {/* <div className="relative">
        <div className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse" />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "200px",
            paddingTop: "7px",
            paddingLeft: "3px",
          }}
        >
          <span>
            {t("irrigate.score", {
              score: Math.round(score),
            })}
          </span>
        </div>
      </div> */}
      <div className="relative">
        <div
          className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse"
          style={{
            height: "62px",
          }}
        />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "200px",
            paddingTop: "10px",
            paddingLeft: "4px",
          }}
        >
          <span>
            {t("irrigate.movesLeft")}
            <div
              style={{
                fontSize: "10vh",
                paddingLeft: "60px",
                textAlign: "left",
                width: "160px",
              }}
            >
              {movesLeft}
            </div>
          </span>
        </div>
      </div>
    </>
  );
};
