import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/FruitDashMachine";

const _score = (state: PortalMachineState) => state.context.score;
const _axes = (state: PortalMachineState) => state.context.axes;

export const FruitDashScoresMobile: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const score = useSelector(portalService, _score);
  const axes = useSelector(portalService, _axes);

  return (
    <>
      <div className="relative">
        <div
          className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse"
          style={{
            height: "-webkit-fill-available",
            top: "6px",
            bottom: "-3px",
          }}
        />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "160px",
            paddingTop: "7px",
            paddingLeft: "3px",
            position: "relative",
          }}
        >
          <span
            style={{
              width: "120px",
            }}
          >
            <span>{t("fruit-dash.score")}</span>
            <span style={{ float: "right" }}>{Math.round(score)}</span>
          </span>
        </div>
      </div>
      <div className="relative">
        <div
          className="h-12 w-full bg-black opacity-50 absolute coins-bb-hud-backdrop-reverse"
          style={{
            height: "-webkit-fill-available",
            top: "6px",
            bottom: "-3px",
          }}
        />
        <div
          className="flex items-center space-x-2 text-xs text-white text-shadow"
          style={{
            width: "160px",
            paddingTop: "7px",
            paddingLeft: "3px",
            position: "relative",
          }}
        >
          <span
            style={{
              width: "120px",
            }}
          >
            <span>{t("fruit-dash.axes")}</span>
            <span style={{ float: "right" }}>{Math.round(axes)}</span>
          </span>
        </div>
      </div>
    </>
  );
};
