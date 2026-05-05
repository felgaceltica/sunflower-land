import React, { useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { FruitDashMission } from "./FruitDashMission";
import { FruitDashDonations } from "./FruitDashDonations";
import {
  FRUIT_DASH_NPC_NAME,
  FRUIT_DASH_NPC_WEREABLES,
} from "../../util/FruitDashConstants";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}
export const FruitDashRulesPanel: React.FC<Props> = ({
  mode,
  showScore,
  showExitButton,
  confirmButtonText,
  onConfirm,
}) => {
  const { t } = useAppTranslation();
  const [tab, setTab] = useState(0);

  return (
    <CloseButtonPanel
      className="overflow-y-hidden"
      bumpkinParts={FRUIT_DASH_NPC_WEREABLES[FRUIT_DASH_NPC_NAME]}
      //currentTab={tab}
      //setCurrentTab={setTab}
      tabs={[
        {
          id: "mission",
          icon: SUNNYSIDE.icons.plant,
          name: t("fruit-dash.mission"),
        },
        {
          id: "donate",
          icon: SUNNYSIDE.icons.heart,
          name: t("donate"),
        },
      ]}
    >
      <>
        {tab === 0 && (
          <FruitDashMission
            mode={mode}
            showScore={showScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
          />
        )}
        {tab === 1 && <FruitDashDonations />}
      </>
    </CloseButtonPanel>
  );
};
