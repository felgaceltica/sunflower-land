import React, { useContext } from "react";
import "../../assets/WhackAMoleComboBar.css";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/WhackAMoleMachine";
import { useSelector } from "@xstate/react";

const _streak = (state: PortalMachineState) => state.context.streak;

type ComboBarProps = {
  currentlevel?: number;
  maxLevel?: number;
};

function interpolateColor(
  color1: string,
  color2: string,
  factor: number,
): string {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

export const WhackAMoleComboBar: React.FC<ComboBarProps> = ({
  maxLevel = 5,
}) => {
  const { portalService } = useContext(PortalContext);
  const streak = useSelector(portalService, _streak);
  const clampedLevel = Math.min(streak, maxLevel);
  const percentage = (clampedLevel / maxLevel) * 100;
  const isMax = clampedLevel === maxLevel;

  const segmentWidth = 100 / maxLevel;
  const textLeft = (clampedLevel - 1) * segmentWidth;

  const comboColors = ["#00bfff", "#00d28a", "#00ff4c", "#ff6a00", "#ff1e00"];
  const fillColor = isMax ? undefined : comboColors[clampedLevel - 1];

  return (
    <div className="combo-container">
      <div className="combo-bar">
        <div
          className={`combo-fill ${isMax ? "fire" : ""}`}
          style={{
            width: `${percentage}%`,
            ...(isMax ? {} : { backgroundColor: fillColor }),
          }}
        />

        <div className="combo-segments">
          {[...Array(maxLevel)].map((_, i) => (
            <div
              key={i}
              className="segment"
              style={{ left: `${(i + 1) * segmentWidth}%` }}
            />
          ))}
        </div>

        {clampedLevel > 0 && (
          <div
            className="combo-text"
            style={{
              left: `calc(${textLeft}% + 2px)`,
              width: `${segmentWidth}%`,
            }}
          >
            {clampedLevel + "x"}
          </div>
        )}
      </div>

      {isMax && (
        <div
          className="combo-fire"
          style={{ left: `calc(${percentage}% - 20px)` }}
        >
          {"🔥"}
        </div>
      )}
    </div>
  );
};
