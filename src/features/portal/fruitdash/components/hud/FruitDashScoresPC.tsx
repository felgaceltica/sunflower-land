import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/FruitDashMachine";

const _score = (state: PortalMachineState) => state.context.score;
const _axes = (state: PortalMachineState) => state.context.axes;

export const FruitDashScoresPC: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const score = useSelector(portalService, _score);
  const axes = useSelector(portalService, _axes);

  return (
    <>
      <div
        className="relative"
        style={{
          height: "60px",
        }}
      >
        <div
          className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse"
          style={{
            height: "56px",
            top: "6px",
            bottom: "-3px",
          }}
        />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "160px",
            paddingTop: "10px",
            paddingLeft: "4px",
            position: "relative",
          }}
        >
          <span>
            {t("fruit-dash.score")}
            <div
              style={{
                fontSize: "6vh",
                paddingTop: "6px",
                textAlign: "left",
                width: "120px",
              }}
            >
              {Math.round(score)}
            </div>
          </span>
        </div>
      </div>
      <div
        className="relative"
        style={{
          height: "60px",
        }}
      >
        <div
          className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse"
          style={{
            height: "56px",
            top: "6px",
          }}
        />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "160px",
            paddingTop: "10px",
            paddingLeft: "4px",
            position: "relative",
          }}
        >
          <span>
            {t("fruit-dash.axes")}
            <div
              style={{
                fontSize: "6vh",
                paddingTop: "6px",
                textAlign: "left",
                width: "120px",
              }}
            >
              {axes}
            </div>
          </span>
        </div>
      </div>
    </>
  );
};
