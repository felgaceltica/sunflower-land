import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { HudContainer } from "components/ui/HudContainer";
import { PortalMachineState } from "../../lib/FruitDashMachine";
import { FruitDashTimer } from "./FruitDashTimer";
import { FruitDashSettings } from "./FruitDashSettings";
import { FruitDashTravel } from "./FruitDashTravel";
import { FruitDashScoresMobile } from "./FruitDashScoresMobile";
import { FruitDashScoresPC } from "./FruitDashScoresPC";
import { useAchievementToast } from "../../providers/AchievementToastProvider";
import { FruitDashTarget } from "./FruitDashTarget";

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;

const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["fruit-dash"]?.achievements ?? {};

const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const FruitDashHud: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const isJoystickActive = useSelector(portalService, _isJoystickActive);
  const achievements = useSelector(portalService, _achievements);
  const isPlaying = useSelector(portalService, _isPlaying);

  const { showAchievementToasts } = useAchievementToast();

  const existingAchievementNames = useRef(Object.keys(achievements));

  useEffect(() => {
    const achievementNames = Object.keys(achievements);

    const newAchievementNames = achievementNames.filter(
      (achievement) => !existingAchievementNames.current.includes(achievement),
    );

    if (newAchievementNames.length > 0) {
      showAchievementToasts(newAchievementNames);
    }

    existingAchievementNames.current = achievementNames;
  }, [achievements, showAchievementToasts]);

  return (
    <div>
      <HudContainer>
        <div>
          <div
            className="absolute"
            style={{
              top: `${PIXEL_SCALE * 4}px`,
              left: `${PIXEL_SCALE * 6}px`,
            }}
          >
            <FruitDashTarget />
            {!isJoystickActive && <FruitDashScoresPC />}
            {isJoystickActive && <FruitDashScoresMobile />}
          </div>

          {(!isJoystickActive || !isPlaying) && <FruitDashTravel />}

          {isPlaying && <FruitDashTimer />}
        </div>
      </HudContainer>

      <HudContainer zIndex="z-50">
        <div>
          {(!isJoystickActive || !isPlaying) && !isPlaying && (
            <FruitDashSettings />
          )}
        </div>
      </HudContainer>
    </div>
  );
};
