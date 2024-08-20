import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { SquareIcon } from "components/ui/SquareIcon";
import { ITEM_DETAILS } from "features/game/types/images";
import { Label } from "components/ui/Label";
import { OBSTACLES_SCORE_TABLE } from "../../util/FarmerRaceConstants";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";

type Props = {
  onBack: () => void;
};

export const FarmerRaceGuide: React.FC<Props> = ({ onBack }) => {
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
          <div className="grow mb-3 text-lg">{t("farmer-race.guide")}</div>
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
        <Label type="default">{t("farmer-race.instructions")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.stopwatch} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("farmer-race.instructions1")}
            </p>
          </div>

          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Oil Reserve"].image} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("farmer-race.instructions2")}
            </p>
          </div>

          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Apple"].image} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("farmer-race.instructions3")}
            </p>
          </div>

          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Pirate Bounty"].image} width={7} />
            <p className="text-xs ml-3 flex-1">
              {t("farmer-race.instructions4")}
            </p>
          </div>
        </div>

        {/* legend */}
        <Label type="default">{t("farmer-race.obstacles")}</Label>
        <table className="w-full text-xs table-fixed border-collapse">
          <tbody>
            {Object.values(OBSTACLES_SCORE_TABLE).map(
              ({ item, points, type }, index) => (
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
                    {t("farmer-race.cropDescription", {
                      points: points,
                      type: type,
                    })}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
