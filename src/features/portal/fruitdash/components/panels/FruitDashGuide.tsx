import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { SquareIcon } from "components/ui/SquareIcon";
import { ITEM_DETAILS } from "features/game/types/images";
import { Label } from "components/ui/Label";
import {
  BONUS_SCORE_TABLE,
  BONUS_SCORE_TABLE_CHRISTMAS,
  BONUS_SCORE_TABLE_HALLOWEEN,
  BONUS_SCORE_TABLE_EASTER,
  OBSTACLES_SCORE_TABLE,
  OBSTACLES_SCORE_TABLE_CHRISTMAS,
  OBSTACLES_SCORE_TABLE_HALLOWEEN,
  POWERUPS_SCORE_TABLE,
} from "../../util/FruitDashConstants";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import { getHalloweenModeSetting } from "../../util/useIsHalloweenMode";
import { getIsTimedEvent } from "../../util/useIsTimedEvent";

type Props = {
  onBack: () => void;
};

export const FruitDashGuide: React.FC<Props> = ({ onBack }) => {
  const { t } = useAppTranslation();
  const button = useSound("button");
  const IS_HALLOWEEN = getHalloweenModeSetting();
  const IS_CHRISTMAS = getIsTimedEvent("CHRISTMAS");
  const IS_EASTER = getIsTimedEvent("EASTER");
  return (
    <div className="flex flex-col gap-1 max-h-[75vh]">
      {/* title */}
      <div className="flex flex-col gap-1">
        <div className="flex text-center">
          <div
            className="flex-none"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
              marginLeft: `${PIXEL_SCALE * 2}px`,
            }}
          >
            <img
              src={SUNNYSIDE.icons.arrow_left}
              className="cursor-pointer"
              onClick={() => {
                button.play();
                onBack();
              }}
              style={{
                width: `${PIXEL_SCALE * 11}px`,
              }}
            />
          </div>
          <div className="grow mb-3 text-lg">{t("fruit-dash.guide")}</div>
          <div className="flex-none">
            <div
              style={{
                width: `${PIXEL_SCALE * 11}px`,
                marginRight: `${PIXEL_SCALE * 2}px`,
              }}
            />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col gap-1 overflow-y-auto scrollable pr-1">
        {/* instructions */}
        <Label type="default">{t("fruit-dash.instructions")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.stopwatch} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("fruit-dash.instructions1")}
            </p>
          </div>

          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Oil Reserve"].image} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("fruit-dash.instructions2")}
            </p>
          </div>

          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={
                IS_EASTER
                  ? ITEM_DETAILS["Pink Egg"].image
                  : ITEM_DETAILS["Apple"].image
              }
              width={7}
            />
            <p className="text-xs ml-3 flex-1">
              {IS_EASTER
                ? t("fruit-dash.instructions3-easter")
                : t("fruit-dash.instructions3")}
            </p>
          </div>

          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Pirate Bounty"].image} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("fruit-dash.instructions4")}
            </p>
          </div>
        </div>
        {/* legend */}
        <Label type="default">{t("fruit-dash.powerups")}</Label>
        <table className="w-full text-xs table-fixed border-collapse">
          <tbody>
            {Object.values(POWERUPS_SCORE_TABLE).map(
              ({ item, description }, index) => (
                <tr key={index}>
                  <td
                    style={{ border: "1px solid #b96f50" }}
                    className="p-1.5 w-1/6"
                  >
                    <div className="flex items-center justify-center">
                      {<SquareIcon icon={item} width={7} />}
                    </div>
                  </td>
                  <td
                    style={{ border: "1px solid #b96f50" }}
                    className="p-1.5 w-5/6"
                  >
                    {t("fruit-dash.scoreDescription", {
                      description: description,
                    })}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {/* legend */}
        <Label type="default">{t("fruit-dash.bonus")}</Label>
        <table className="w-full text-xs table-fixed border-collapse">
          <tbody>
            {Object.values(
              IS_HALLOWEEN
                ? BONUS_SCORE_TABLE_HALLOWEEN
                : IS_CHRISTMAS
                  ? BONUS_SCORE_TABLE_CHRISTMAS
                  : IS_EASTER
                    ? BONUS_SCORE_TABLE_EASTER
                    : BONUS_SCORE_TABLE,
            ).map(({ item, description }, index) => (
              <tr key={index}>
                <td
                  style={{ border: "1px solid #b96f50" }}
                  className="p-1.5 w-1/6"
                >
                  <div className="flex items-center justify-center">
                    {<SquareIcon icon={item} width={7} />}
                  </div>
                </td>
                <td
                  style={{ border: "1px solid #b96f50" }}
                  className="p-1.5 w-5/6"
                >
                  {t("fruit-dash.scoreDescription", {
                    description: description,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* legend */}
        <Label type="default">{t("fruit-dash.obstacles")}</Label>
        <table className="w-full text-xs table-fixed border-collapse">
          <tbody>
            {Object.values(
              IS_HALLOWEEN
                ? OBSTACLES_SCORE_TABLE_HALLOWEEN
                : IS_CHRISTMAS
                  ? OBSTACLES_SCORE_TABLE_CHRISTMAS
                  : OBSTACLES_SCORE_TABLE,
            ).map(({ item, description }, index) => (
              <tr key={index}>
                <td
                  style={{ border: "1px solid #b96f50" }}
                  className="p-1.5 w-1/6"
                >
                  <div className="flex items-center justify-center">
                    {<SquareIcon icon={item} width={7} />}
                  </div>
                </td>
                <td
                  style={{ border: "1px solid #b96f50" }}
                  className="p-1.5 w-5/6"
                >
                  {t("fruit-dash.scoreDescription", {
                    description: description,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
