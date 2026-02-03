import React, { useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { WhackAMoleMission } from "./WhackAMoleMission";
import { WhackAMoleDonations } from "./WhackAMoleDonations";
import { WhackAMole_NPC_WEREABLES } from "../../util/WhackAMoleConstants";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}
export const WhackAMoleRulesPanel: React.FC<Props> = ({
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
      bumpkinParts={WhackAMole_NPC_WEREABLES["WhackaMole"]}
      //currentTab={tab}
      //setCurrentTab={setTab}
      tabs={[
        {
          id: "mission",
          icon: SUNNYSIDE.icons.plant,
          name: t("whackamole.mission"),
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
          <WhackAMoleMission
            mode={mode}
            showScore={showScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
          />
        )}
        {tab === 1 && <WhackAMoleDonations />}
      </>
    </CloseButtonPanel>
  );
};
