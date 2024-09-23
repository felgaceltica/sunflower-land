import React, { useContext, useEffect } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { HudContainer } from "components/ui/HudContainer";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
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
const _target = (state: PortalMachineState) =>
  state.context.state?.minigames.prizes["fruit-dash"]?.score ?? 0;
const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["fruit-dash"]?.achievements ?? {};
const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const FruitDashHud: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const isJoystickActive = useSelector(portalService, _isJoystickActive);
  const target = useSelector(portalService, _target);
  const achievements = useSelector(portalService, _achievements);
  const isPlaying = useSelector(portalService, _isPlaying);

  // achievement toast provider
  const { showAchievementToasts } = useAchievementToast();

  // show new achievements
  const [existingAchievementNames, setExistingAchievements] = React.useState(
    Object.keys(achievements),
  );
  useEffect(() => {
    const achievementNames = Object.keys(achievements);
    const newAchievementNames = achievementNames.filter(
      (achievement) => !existingAchievementNames.includes(achievement),
    );

    if (newAchievementNames.length > 0) {
      showAchievementToasts(newAchievementNames);
      setExistingAchievements(achievementNames);
    }
  }, [achievements]);

  return (
    <HudContainer zIndex={99999}>
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
        {(!isJoystickActive || !isPlaying) && (
          <>
            <FruitDashTravel />
            <FruitDashSettings />
          </>
        )}
        {isPlaying && (
          <>
            <FruitDashTimer />
          </>
        )}
      </div>
    </HudContainer>
  );
};
