import React, { useContext, useEffect } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { HudContainer } from "components/ui/HudContainer";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/FarmerRaceMachine";
import { FarmerRaceTimer } from "./FarmerRaceTimer";
import { FarmerRaceSettings } from "./FarmerRaceSettings";
import { FarmerRaceTravel } from "./FarmerRaceTravel";
import { FarmerRaceScores } from "./FarmerRaceScores";
import classNames from "classnames";
import { useAchievementToast } from "../../providers/AchievementToastProvider";
import { FarmerRaceTarget } from "./FarmerRaceTarget";

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;
const _target = (state: PortalMachineState) =>
  state.context.state?.minigames.prizes["farmer-race"]?.score ?? 0;
const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["farmer-race"]?.achievements ?? {};
const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const FarmerRaceHud: React.FC = () => {
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
      <div
        className={classNames({
          "pointer-events-none": isJoystickActive,
        })}
      >
        <div
          className="absolute"
          style={{
            top: `${PIXEL_SCALE * 4}px`,
            left: `${PIXEL_SCALE * 6}px`,
          }}
        >
          <FarmerRaceTarget />
          <FarmerRaceScores />
        </div>

        {!isPlaying && (
          <>
            <FarmerRaceTravel />
            <FarmerRaceSettings />
          </>
        )}
        {isPlaying && (
          <>
            <FarmerRaceTimer />
          </>
        )}
      </div>
    </HudContainer>
  );
};
