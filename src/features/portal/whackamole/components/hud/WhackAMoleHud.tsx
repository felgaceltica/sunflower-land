import React, { useContext, useEffect } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { HudContainer } from "components/ui/HudContainer";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/WhackAMoleMachine";
import { WhackAMoleTimer } from "./WhackAMoleTimer";
import { WhackAMoleSettings } from "./WhackAMoleSettings";
import { WhackAMoleTravel } from "./WhackAMoleTravel";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { WhackAMoleScores } from "./WhackAMoleScores";
import { WhackAMoleTarget } from "./WhackAMoleTarget";
import { WhackAMoleComboBar } from "./WhackAMoleCombo";
import { WhackAMoleLivesDisplay } from "./WhackAMoleLivesDisplay";
//import { useAchievementToast } from "../../providers/AchievementToastProvider";

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;
const _target = (state: PortalMachineState) =>
  state.context.state?.minigames.prizes["mine-whack"]?.score ?? 0;
const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["mine-whack"]?.achievements ?? {};
const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const WhackAMoleHud: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const isJoystickActive = useSelector(portalService, _isJoystickActive);
  const target = useSelector(portalService, _target);
  const achievements = useSelector(portalService, _achievements);
  const isPlaying = useSelector(portalService, _isPlaying);

  // achievement toast provider
  //const { showAchievementToasts } = useAchievementToast();

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
      //showAchievementToasts(newAchievementNames);
      setExistingAchievements(achievementNames);
    }
  }, [achievements]);

  return (
    <div>
      <HudContainer zIndex="z-50">
        <WhackAMoleSettings />
      </HudContainer>
      <HudContainer>
        <div>
          <div
            className="absolute"
            style={{
              top: `${PIXEL_SCALE * 2}px`,
              left: `${PIXEL_SCALE * 3}px`,
            }}
          >
            {isPlaying && (
              <>
                <WhackAMoleTarget />
                <WhackAMoleScores />
                <WhackAMoleComboBar maxLevel={5} />
              </>
            )}
          </div>

          {
            <>
              <WhackAMoleTravel />
            </>
          }
          {isPlaying && (
            <>
              <WhackAMoleTimer />
              <WhackAMoleLivesDisplay />
            </>
          )}
        </div>
      </HudContainer>
    </div>
  );
};
