import React, { useContext } from "react";

import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { Label } from "components/ui/Label";
import { FruitDashPrize } from "./FruitDashPrize";
import { FruitDashAttempts } from "./FruitDashAttempts";
import factions from "assets/icons/factions.webp";
import { getAttemptsLeft } from "../../util/Utils";
import { goHome } from "features/portal/lib/portalUtil";
import { PortalMachineState } from "../../lib/FruitDashMachine";
import { SUNNYSIDE } from "assets/sunnyside";
import { FruitDashGuide } from "./FruitDashGuide";
import { SquareIcon } from "components/ui/SquareIcon";
import { PIXEL_SCALE } from "features/game/lib/constants";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}

const _minigame = (state: PortalMachineState) =>
  state.context.state?.minigames.games["fruit-dash"];
const _lastScore = (state: PortalMachineState) => state.context.lastScore;

export const FruitDashMission: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
}) => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const minigame = useSelector(portalService, _minigame);
  const attemptsLeft = getAttemptsLeft(minigame);
  const lastScore = useSelector(portalService, _lastScore);

  const dateKey = new Date().toISOString().slice(0, 10);

  const [page, setPage] = React.useState<"main" | "achievements" | "guide">(
    "main",
  );

  return (
    <>
      {page === "main" && (
        <>
          <div>
            <div className="w-full relative flex justify-between gap-1 items-center mb-1 py-1 pl-2">
              {mode === "introduction" && (
                <Label type="default" icon={factions}>
                  {t("fruit-dash.portal.title")}
                </Label>
              )}
              {mode === "success" && (
                <Label type="success" icon={SUNNYSIDE.icons.confirm}>
                  {t("fruit-dash.missionComplete")}
                </Label>
              )}
              {mode === "failed" && (
                <Label type="danger" icon={SUNNYSIDE.icons.death}>
                  {t("fruit-dash.missionFailed")}
                </Label>
              )}
              <FruitDashAttempts attemptsLeft={attemptsLeft} />
            </div>

            <div
              className="flex flex-row"
              style={{
                marginBottom: `${PIXEL_SCALE * 1}px`,
              }}
            >
              <div className="flex justify-between flex-col space-y-1 px-1 mb-3 text-sm flex-grow">
                {showScore && (
                  <span>
                    {t("fruit-dash.score", {
                      score: Math.round(lastScore),
                    })}
                  </span>
                )}
                <span>
                  {t("fruit-dash.bestToday", {
                    score: minigame?.history[dateKey]?.highscore
                      ? Math.round(minigame?.history[dateKey]?.highscore)
                      : 0,
                  })}
                </span>
                <span>
                  {t("fruit-dash.bestAllTime", {
                    score: Object.values(minigame?.history ?? {}).reduce(
                      (acc, { highscore }) =>
                        Math.round(Math.max(acc, highscore)),
                      0,
                    ),
                  })}
                </span>
              </div>
              <div className="flex mt-1 space-x-1">
                {/* {hasBetaAccess && (
                  <Button
                    className="whitespace-nowrap capitalize w-12"
                    onClick={() => setPage("achievements")}
                  >
                    <div className="flex flex-row items-center gap-1">
                      <SquareIcon icon={trophy} width={9} />
                    </div>
                  </Button>
                )} */}
                <Button
                  className="whitespace-nowrap capitalize w-12"
                  onClick={() => setPage("guide")}
                >
                  <div className="flex flex-row items-center gap-1">
                    <SquareIcon
                      icon={SUNNYSIDE.icons.expression_confused}
                      width={7}
                    />
                  </div>
                </Button>
              </div>
            </div>

            <FruitDashPrize />
          </div>

          <div className="flex mt-1 space-x-1">
            {showExitButton && (
              <Button className="whitespace-nowrap capitalize" onClick={goHome}>
                {t("exit")}
              </Button>
            )}
            <Button
              className="whitespace-nowrap capitalize"
              onClick={onConfirm}
            >
              {confirmButtonText}
            </Button>
          </div>
        </>
      )}
      {/* {page === "achievements" && (
        <FruitDashAchievementsList onBack={() => setPage("main")} />
      )} */}
      {page === "guide" && <FruitDashGuide onBack={() => setPage("main")} />}
    </>
  );
};
