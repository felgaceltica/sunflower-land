import React, { useContext, useEffect, useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { OuterPanel } from "components/ui/Panel";
import { secondsToString } from "lib/utils/time";
import coins from "assets/icons/coins.webp";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/FruitDashMachine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";

const _history = (state: PortalMachineState) => {
  return state.context.state?.minigames.games["fruit-dash"]?.history ?? {};
};

const _prize = (state: PortalMachineState) => {
  return state.context.state?.minigames.prizes["fruit-dash"];
};

export const FruitDashPrize: React.FC = () => {
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

  const history = useSelector(
    portalService,
    _history,
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next),
  );

  if (!prize) {
    return (
      <OuterPanel>
        <div className="px-1">
          <Label type="danger" icon={SUNNYSIDE.icons.sad}>
            {t("fruit-dash.noPrizesAvailable")}
          </Label>
        </div>
      </OuterPanel>
    );
  }

  const dateKey = now === null ? "" : new Date(now).toISOString().slice(0, 10);
  const dailyHighscore = dateKey ? (history[dateKey]?.highscore ?? 0) : 0;
  const isComplete = dailyHighscore > prize.score;
  const secondsLeft = now === null ? 0 : Math.max(prize.endAt - now, 0) / 1000;

  return (
    <OuterPanel>
      <div className="px-1">
        <span className="text-xs mb-2">
          {t("fruit-dash.portal.missionObjectives", {
            targetScore: prize.score,
          })}
        </span>

        <div className="flex justify-between mt-2 flex-wrap">
          {isComplete ? (
            <Label type="success" icon={SUNNYSIDE.icons.confirm}>
              {t("fruit-dash.completed")}
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
