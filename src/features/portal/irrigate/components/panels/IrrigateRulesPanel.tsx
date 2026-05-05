import React, { useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { IrrigateMission } from "./IrrigateMission";
import { IrrigateDonations } from "./IrrigateDonations";
import { IRRIGATE_NPC_WEREABLES } from "../../util/IrrigateConstants";

interface Props {
  mode: "introduction" | "success" | "failed";
  showScore: boolean;
  showExitButton: boolean;
  confirmButtonText: string;
  onConfirm: () => void;
}
export const IrrigateRulesPanel: React.FC<Props> = ({
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
      bumpkinParts={IRRIGATE_NPC_WEREABLES["Felga"]}
      //currentTab={tab}
      //setCurrentTab={setTab}
      tabs={[
        {
          id: "mission",
          icon: SUNNYSIDE.icons.plant,
          name: t("irrigate.mission"),
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
          <IrrigateMission
            mode={mode}
            showScore={showScore}
            showExitButton={showExitButton}
            confirmButtonText={confirmButtonText}
            onConfirm={onConfirm}
          />
        )}
        {tab === 1 && <IrrigateDonations />}
      </>
    </CloseButtonPanel>
  );
};
