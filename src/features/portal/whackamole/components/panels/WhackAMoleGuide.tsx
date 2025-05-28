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
            <SquareIcon icon={SUNNYSIDE.icons.confirm} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic1.a")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.stopwatch} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic1.b")}</p>
          </div>
        </div>
        {/* how to play */}
        <Label type="default">{t("whackamole.topic2")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.icons.mouse} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic2.a")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.tools.hammer} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic2.b")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon
              icon={ITEM_DETAILS["Orange Tunnel Bunny"].image}
              width={7}
            />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic2.c")}</p>
          </div>
        </div>
        {/* tips */}
        <Label type="default">{t("whackamole.topic3")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={ITEM_DETAILS["Tunnel Mole"].image} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic3.a")}</p>
          </div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={SUNNYSIDE.resource.plot} width={7} />
            <p className="text-xs ml-3 flex-1">{t("whackamole.topic3.b")}</p>
          </div>
        </div>
        {/* levels */}
        <Label type="default">{t("whackamole.topic4")}</Label>
        <table className="w-full text-xs table-fixed border-collapse">
          <tbody>
            <tr>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-1/6"
              >
                <div className="flex items-center justify-center">
                  {
                    <SquareIcon
                      icon={ITEM_DETAILS["Tunnel Mole"].image}
                      width={15}
                    />
                  }
                </div>
              </td>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-5/6"
              >
                {"+5 points"}
              </td>
            </tr>
            <tr>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-1/6"
              >
                <div className="flex items-center justify-center">
                  {
                    <SquareIcon
                      icon={ITEM_DETAILS["Rocky the Mole"].image}
                      width={15}
                    />
                  }
                </div>
              </td>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-5/6"
              >
                {"+10 points"}
              </td>
            </tr>
            <tr>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-1/6"
              >
                <div className="flex items-center justify-center">
                  {
                    <SquareIcon
                      icon={ITEM_DETAILS["Nugget"].image}
                      width={15}
                    />
                  }
                </div>
              </td>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-5/6"
              >
                {"+15 points"}
              </td>
            </tr>
            <tr>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-1/6"
              >
                <div className="flex items-center justify-center">
                  {
                    <SquareIcon
                      icon={ITEM_DETAILS["Orange Tunnel Bunny"].image}
                      width={13}
                    />
                  }
                </div>
              </td>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-5/6"
              >
                {"-20 points"}
              </td>
            </tr>
            <tr>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-1/6"
              >
                <div className="flex items-center justify-center">
                  {
                    <SquareIcon
                      icon={ITEM_DETAILS["White Tunnel Bunny"].image}
                      width={13}
                    />
                  }
                </div>
              </td>
              <td
                style={{ border: "1px solid #b96f50" }}
                className="p-1.5 w-5/6"
              >
                {"-30 points / -5 seconds"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
