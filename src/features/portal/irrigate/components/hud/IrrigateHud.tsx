import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { HudContainer } from "components/ui/HudContainer";
import { PortalMachineState } from "../../lib/IrrigateMachine";
import { IrrigateTimer } from "./IrrigateTimer";
import { IrrigateSettings } from "./IrrigateSettings";
import { IrrigateTravel } from "./IrrigateTravel";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { IrrigateScores } from "./IrrigateScores";
import { IrrigateTarget } from "./IrrigateTarget";
//import { useAchievementToast } from "../../providers/AchievementToastProvider";

const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["fruit-dash"]?.achievements ?? {};
const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const IrrigateHud: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const achievements = useSelector(portalService, _achievements);
  const isPlaying = useSelector(portalService, _isPlaying);

  // achievement toast provider
  //const { showAchievementToasts } = useAchievementToast();

  // show new achievements
  const existingAchievementNames = useRef(Object.keys(achievements));

  useEffect(() => {
    const achievementNames = Object.keys(achievements);

    const newAchievementNames = achievementNames.filter(
      (achievement) => !existingAchievementNames.current.includes(achievement),
    );

    if (newAchievementNames.length > 0) {
      //showAchievementToasts(newAchievementNames);
    }

    existingAchievementNames.current = achievementNames;
  }, [achievements]);

  return (
    <HudContainer zIndex={"99999"}>
      <div>
        <div
          className="absolute"
          style={{
            top: `${PIXEL_SCALE * 0}px`,
            left: `${PIXEL_SCALE * 3}px`,
          }}
        >
          {isPlaying && (
            <>
              <IrrigateTarget />
              <IrrigateScores />
            </>
          )}
        </div>

        {
          <>
            <IrrigateTravel />
            <IrrigateSettings />
          </>
        }
        {isPlaying && (
          <>
            <IrrigateTimer />
          </>
        )}
      </div>
    </HudContainer>
  );
};
