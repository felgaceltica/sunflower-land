// import React, { useContext } from "react";
// import { useActor } from "@xstate/react";
// import { PortalContext } from "../../lib/PortalProvider";
// import { PIXEL_SCALE } from "features/game/lib/constants";
// import { SUNNYSIDE } from "assets/sunnyside";
// import worldIcon from "assets/icons/world_small.png";
// import zoomIn from "assets/icons/portal/whackamole/ZoomIn.png";
// import zoomOut from "assets/icons/portal/whackamole/ZoomOut.png";
// import { goHome } from "../../../lib/portalUtil";
// import { HudContainer } from "components/ui/HudContainer";

// export const WhackAMoleHUD: React.FC = () => {
//   const { portalService } = useContext(PortalContext);
//   const [portalState] = useActor(portalService);

//   const travelHome = () => {
//     goHome();
//   };

//   const postZoomIn =() => {
//     const event = new Event("zoomIn");
//     window.dispatchEvent(event);
//     //window.postMessage({ event: "zoomIn" }, "*");
//   }

//   const postZoomOut =() => {
//     const event = new Event("zoomOut");
//     window.dispatchEvent(event);
//     //window.postMessage({ event: "zoomOut" }, "*");
//   }

//   return (
//     <>
//       <HudContainer>
//       <div
//           className="fixed z-50 flex flex-col justify-between"
//           style={{
//             left: `${PIXEL_SCALE * 3}px`,
//             bottom: `${PIXEL_SCALE * 3}px`,
//             width: `${PIXEL_SCALE * 22}px`,
//           }}
//         >
//           <div
//             id="deliveries"
//             className="flex relative z-50 justify-center cursor-pointer hover:img-highlight"
//             style={{
//               width: `${PIXEL_SCALE * 22}px`,
//               height: `${PIXEL_SCALE * 23}px`,
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               travelHome();
//             }}
//           >
//             <img
//               src={SUNNYSIDE.ui.round_button}
//               className="absolute"
//               style={{
//                 width: `${PIXEL_SCALE * 22}px`,
//               }}
//             />
//             <img
//               src={worldIcon}
//               style={{
//                 width: `${PIXEL_SCALE * 12}px`,
//                 left: `${PIXEL_SCALE * 5}px`,
//                 top: `${PIXEL_SCALE * 4}px`,
//               }}
//               className="absolute"
//             />
//           </div>
//         </div>
//         <div
//           className="fixed z-50 flex flex-col justify-between"
//           style={{
//             right: `${PIXEL_SCALE * 3}px`,
//             bottom: `${PIXEL_SCALE * 3}px`,
//             width: `${PIXEL_SCALE * 22}px`,
//           }}
//         >
//           <div
//             id="deliveries"
//             className="flex relative z-50 justify-center cursor-pointer hover:img-highlight"
//             style={{
//               width: `${PIXEL_SCALE * 22}px`,
//               height: `${PIXEL_SCALE * 25}px`,
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               postZoomIn();
//             }}
//           >
//             <img
//               src={SUNNYSIDE.ui.round_button}
//               className="absolute"
//               style={{
//                 width: `${PIXEL_SCALE * 22}px`,
//               }}
//             />
//             <img
//               src={zoomIn}
//               style={{
//                 width: `${PIXEL_SCALE * 12}px`,
//                 left: `${PIXEL_SCALE * 5}px`,
//                 top: `${PIXEL_SCALE * 5}px`,
//               }}
//               className="absolute"
//             />
//           </div>
//           <div
//             id="deliveries"
//             className="flex relative z-50 justify-center cursor-pointer hover:img-highlight"
//             style={{
//               width: `${PIXEL_SCALE * 22}px`,
//               height: `${PIXEL_SCALE * 23}px`,
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               postZoomOut();
//             }}
//           >
//             <img
//               src={SUNNYSIDE.ui.round_button}
//               className="absolute"
//               style={{
//                 width: `${PIXEL_SCALE * 22}px`,
//               }}
//             />
//             <img
//               src={zoomOut}
//               style={{
//                 width: `${PIXEL_SCALE * 12}px`,
//                 left: `${PIXEL_SCALE * 5}px`,
//                 top: `${PIXEL_SCALE * 5}px`,
//               }}
//               className="absolute"
//             />
//           </div>
//         </div>
//       </HudContainer>
//     </>
//   );
// };
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
//import { useAchievementToast } from "../../providers/AchievementToastProvider";

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;
const _target = (state: PortalMachineState) =>
  state.context.state?.minigames.prizes["minewhack"]?.score ?? 0;
const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["minewhack"]?.achievements ?? {};
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
              top: `${PIXEL_SCALE * 0}px`,
              left: `${PIXEL_SCALE * 3}px`,
            }}
          >
            {isPlaying && (
              <>
                <WhackAMoleTarget />
                <WhackAMoleScores />
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
            </>
          )}
        </div>
      </HudContainer>
    </div>
  );
};
