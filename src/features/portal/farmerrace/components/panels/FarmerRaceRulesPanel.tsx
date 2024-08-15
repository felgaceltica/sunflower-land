import React, { useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { FarmerRaceMission } from "./FarmerRaceMission";
import { FarmerRaceDonations } from "./FarmerRaceDonations";
import { FARMER_RACE_NPC_WEREABLES } from "../../util/FarmerRaceConstants";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}
export const FarmerRaceRulesPanel: React.FC<Props> = ({
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
      bumpkinParts={FARMER_RACE_NPC_WEREABLES["Felga"]}
      currentTab={tab}
      setCurrentTab={setTab}
      tabs={[
        {
          icon: SUNNYSIDE.icons.plant,
          name: t("farmer-race.mission"),
        },
        {
          icon: SUNNYSIDE.icons.heart,
          name: t("donate"),
        },
      ]}
    >
      <>
        {tab === 0 && (
          <FarmerRaceMission
            mode={mode}
            showScore={showScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
          />
        )}
        {tab === 1 && <FarmerRaceDonations />}
      </>
    </CloseButtonPanel>
  );
};
