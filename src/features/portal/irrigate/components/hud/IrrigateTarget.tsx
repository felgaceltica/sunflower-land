import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "../../lib/IrrigateMachine";

const _targetMoves = (state: PortalMachineState) => state.context.maxMoves + 1;
const _movesMade = (state: PortalMachineState) => state.context.movesMade;

export const IrrigateTarget: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();

  const targetMoves = useSelector(portalService, _targetMoves);
  const movesMade = useSelector(portalService, _movesMade);

  const isTargetReached = movesMade < targetMoves;

  return (
    <Label
      icon={SUNNYSIDE.resource.pirate_bounty}
      secondaryIcon={isTargetReached ? SUNNYSIDE.icons.confirm : undefined}
      type={isTargetReached ? "success" : "vibrant"}
    >
      {t("irrigate.targetScore", {
        moves: targetMoves,
      })}
    </Label>
  );
};
