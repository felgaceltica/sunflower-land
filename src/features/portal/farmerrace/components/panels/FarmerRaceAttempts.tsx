import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";

interface Props {
  attemptsLeft: number;
}

export const FarmerRaceAttempts: React.FC<Props> = ({ attemptsLeft }) => {
  const { t } = useAppTranslation();

  if (attemptsLeft === Infinity) {
    return <Label type="success">{t("farmer-race.unlimitedAttempts")}</Label>;
  }

  if (attemptsLeft > 0 && attemptsLeft !== 1) {
    return (
      <Label type="vibrant">
        {t("farmer-race.attemptsRemainingPlural", {
          attempts: attemptsLeft,
        })}
      </Label>
    );
  }

  if (attemptsLeft === 1) {
    return (
      <Label type="vibrant">
        {t("farmer-race.attemptsRemainingSingular", {
          attempts: attemptsLeft,
        })}
      </Label>
    );
  }

  return <Label type="danger">{t("farmer-race.noAttemptsRemaining")}</Label>;
};
