import React, { useContext } from "react";
import heart_full from "../../assets/heart.png";
import heart_empty from "../../assets/heart_empty.png";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { PortalMachineState } from "../../lib/WhackAMoleMachine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";

const _lives = (state: PortalMachineState) => state.context.lives;
const maxLives = 3;

export const WhackAMoleLivesDisplay: React.FC = () => {
  const hearts = [];
  const { portalService } = useContext(PortalContext);

  const lives = useSelector(portalService, _lives);

  for (let i = 0; i < maxLives; i++) {
    const isFull = i < lives;
    hearts.push(
      <img
        key={i}
        src={isFull ? heart_full : heart_empty}
        style={{
          width: "32px",
          height: "32px",
          imageRendering: "pixelated",
          marginRight: "4px",
        }}
      />,
    );
  }

  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: `${PIXEL_SCALE * 3}px`,
        right: `${PIXEL_SCALE * 3}px`,
      }}
    >
      {hearts}
    </div>
  );
};
