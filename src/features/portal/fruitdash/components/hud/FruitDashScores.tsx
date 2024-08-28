import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/FruitDashMachine";

const _score = (state: PortalMachineState) => state.context.score;
const _axes = (state: PortalMachineState) => state.context.axes;

export const FruitDashScores: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const score = useSelector(portalService, _score);
  const axes = useSelector(portalService, _axes);

  return (
    <>
      <div className="relative">
        <div className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse" />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "180px",
            paddingTop: "7px",
            paddingLeft: "3px",
          }}
        >
          <span>
            {t("fruit-dash.score", {
              score: Math.round(score),
            })}
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse" />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "180px",
            paddingTop: "7px",
            paddingLeft: "3px",
          }}
        >
          <span>
            {t("fruit-dash.axes", {
              axes: Math.round(axes),
            })}
          </span>
        </div>
      </div>
    </>
  );
};
