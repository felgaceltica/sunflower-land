import React, { useContext, useEffect, useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { OuterPanel } from "components/ui/Panel";
import { secondsToString } from "lib/utils/time";
import coins from "assets/icons/coins.webp";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/WhackAMoleMachine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";

const _prize = (state: PortalMachineState) => {
  return state.context.state?.minigames.prizes["mine-whack"];
};

export const WhackAMolePrize: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setNow(Date.now());
    };

    const timeout = window.setTimeout(updateTime, 0);
    const interval = window.setInterval(updateTime, 1000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const prize = useSelector(
    portalService,
    _prize,
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
  );

  const dailyHighscore = useSelector(
    portalService,
    (state: PortalMachineState) => {
      if (now === null) {
        return 0;
      }

      const dateKey = new Date(now).toISOString().slice(0, 10);
      const minigame = state.context.state?.minigames.games["mine-whack"];
      const history = minigame?.history ?? {};

      return history[dateKey]?.highscore ?? 0;
    },
  );

  if (!prize) {
    return (
      <OuterPanel>
        <div className="px-1">
          <Label type="danger" icon={SUNNYSIDE.icons.sad}>
            {t("whackamole.noPrizesAvailable")}
          </Label>
        </div>
      </OuterPanel>
    );
  }

  const isComplete = dailyHighscore > prize.score;
  const secondsLeft = now === null ? 0 : Math.max(prize.endAt - now, 0) / 1000;

  return (
    <OuterPanel>
      <div className="px-1">
        <span className="text-xs mb-2">
          {t("whackamole.portal.missionObjectives", {
            targetScore: prize.score,
          })}
        </span>

        <div className="flex justify-between mt-2 flex-wrap">
          {isComplete ? (
            <Label type="success" icon={SUNNYSIDE.icons.confirm}>
              {t("whackamole.completed")}
            </Label>
          ) : (
            <Label type="info" icon={SUNNYSIDE.icons.stopwatch}>
              {secondsToString(secondsLeft, { length: "medium" })}
            </Label>
          )}

          <div className="flex items-center space-x-2">
            {!!prize.coins && (
              <Label icon={coins} type="warning">
                {prize.coins}
              </Label>
            )}
          </div>
        </div>
      </div>
    </OuterPanel>
  );
};
