import React, { useState } from "react";
import { InventoryItemName } from "features/game/types/game";
import sunflower from "assets/decorations/bush.png";
import Decimal from "decimal.js-light";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { Modal } from "components/ui/Modal";
import { LandscapingDecorations } from "./LandscapingDecorations";
import { NPC_WEARABLES } from "lib/npcs";
import { OuterPanel } from "components/ui/Panel";

interface Props {
  show: boolean;
  onHide: () => void;
}

export type TabItems = Record<string, { items: object }>;

export type Inventory = Partial<Record<InventoryItemName, Decimal>>;

export const CraftDecorationsModal: React.FC<Props> = ({ show, onHide }) => {
  const [tab, setTab] = useState(0);
  return (
    <Modal size="lg" show={show} onHide={onHide}>
      <CloseButtonPanel
        tabs={[{ icon: sunflower, name: "Landscaping" }]}
        setCurrentTab={setTab}
        currentTab={tab}
        onClose={onHide}
        bumpkinParts={NPC_WEARABLES.grimtooth}
        container={OuterPanel}
      >
        {tab === 0 && <LandscapingDecorations onClose={onHide} />}
      </CloseButtonPanel>
    </Modal>
  );
};
