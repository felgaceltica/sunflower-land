import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { SquareIcon } from "components/ui/SquareIcon";
import { ITEM_DETAILS } from "features/game/types/images";
import { Label } from "components/ui/Label";
// import {
//   BONUS_SCORE_TABLE,
//   OBSTACLES_SCORE_TABLE,
//   POWERUPS_SCORE_TABLE,
// } from "../../util/FruitDashConstants";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";
import { BUMPKIN_SKILL_TREE } from "features/game/types/bumpkinSkills";

type Props = {
  onBack: () => void;
};

export const WhackAMoleGuide: React.FC<Props> = ({ onBack }) => {
  const { t } = useAppTranslation();

  const button = useSound("button");

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
          <div className="grow mb-3 text-lg">{t("whackamole.guide")}</div>
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
        {/* objective */}
        <Label type="default">{t("whackamole.topic1")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.water} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic1.a")}</p>
          </div>
        </div>
        {/* how to play */}
        <Label type="default">{t("whackamole.topic2")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={BUMPKIN_SKILL_TREE["Free Range"].image}
              width={7}
            />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic2.a")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Pumpkin"].image} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic2.b")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.stopwatch} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic2.c")}</p>
          </div>
        </div>
        {/* tips */}
        <Label type="default">{t("whackamole.topic3")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.expression_confused} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic3.a")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.confirm} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic3.b")}</p>
          </div>
        </div>
        {/* levels */}
        <Label type="default">{t("whackamole.topic4")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Iron"].image} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic4.a")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Gold"].image} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic4.b")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Crimstone"].image} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic4.c")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
