import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { secondsToString } from "lib/utils/time";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/FruitDashMachine";

const _startedAt = (state: PortalMachineState) => state.context.startedAt;

export const FruitDashTimer: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const startedAt = useSelector(portalService, _startedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(interval);
  }, []);

  const secondsPassed = !startedAt ? 0 : Math.max(now - startedAt, 0) / 1000;

  return (
    <Label
      className="absolute"
      icon={SUNNYSIDE.icons.stopwatch}
      type={"info"}
      style={{
        top: `${PIXEL_SCALE * 3}px`,
        right: `${PIXEL_SCALE * 3}px`,
      }}
    >
      {secondsToString(secondsPassed, {
        length: "full",
      })}
    </Label>
  );
};
