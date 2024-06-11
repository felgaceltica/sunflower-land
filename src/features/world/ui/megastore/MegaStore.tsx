import React, { useContext, useEffect, useState } from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { ITEM_IDS } from "features/game/types/bumpkin";
import { BUMPKIN_ITEM_BUFF_LABELS } from "features/game/types/bumpkinItemBuffs";
import { ITEM_DETAILS } from "features/game/types/images";
import { NPC_WEARABLES } from "lib/npcs";
import { getTimeLeft, secondsToString } from "lib/utils/time";

import { COLLECTIBLE_BUFF_LABELS } from "features/game/types/collectibleItemBuffs";
import { BuffLabel } from "features/game/types";
import { ItemDetail } from "./components/ItemDetail";
import { ItemsList } from "./components/ItemsList";
import { WearablesItem, CollectiblesItem } from "features/game/types/game";
import { MachineState } from "features/game/lib/gameMachine";
import { Context } from "features/game/GameProvider";
import { useSelector } from "@xstate/react";

import lightning from "assets/icons/lightning.png";
import shopIcon from "assets/icons/shop.png";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { getImageUrl } from "lib/utils/getImageURLS";
import { ModalOverlay } from "components/ui/ModalOverlay";

interface Props {
  onClose: () => void;
}

// type guard for WearablesItem | CollectiblesItem
export const isWearablesItem = (
  item: WearablesItem | CollectiblesItem
): item is WearablesItem => {
  return (item as WearablesItem).name in ITEM_IDS;
};

export const getItemImage = (
  item: WearablesItem | CollectiblesItem | null
): string => {
  if (!item) return "";

  if (isWearablesItem(item)) {
    return getImageUrl(ITEM_IDS[item.name]);
  }

  return ITEM_DETAILS[item.name].image;
};

export const getItemBuffLabel = (
  item: WearablesItem | CollectiblesItem | null
): BuffLabel | undefined => {
  if (!item) return;

  if (isWearablesItem(item)) {
    return BUMPKIN_ITEM_BUFF_LABELS[item.name];
  }

  return COLLECTIBLE_BUFF_LABELS[item.name];
};

const _megastore = (state: MachineState) => state.context.state.megastore;

export const MegaStore: React.FC<Props> = ({ onClose }) => {
  const { gameService } = useContext(Context);
  const megastore = useSelector(gameService, _megastore);

  const [selectedItem, setSelectedItem] = useState<
    WearablesItem | CollectiblesItem | null
  >(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedItem && !isVisible) {
      setIsVisible(true);
    }
  }, [selectedItem, isVisible]);

  const handleClickItem = (item: WearablesItem | CollectiblesItem) => {
    setSelectedItem(item);
  };

  const getTotalSecondsAvailable = () => {
    const { from, to } = megastore.available;

    return (to - from) / 1000;
  };

  const timeRemaining = getTimeLeft(
    megastore.available.from,
    getTotalSecondsAvailable()
  );

  const { t } = useAppTranslation();
  return (
    <CloseButtonPanel
      bumpkinParts={NPC_WEARABLES.stella}
      tabs={[{ icon: shopIcon, name: "Mega Store" }]}
      onClose={onClose}
    >
      <div className="relative h-full w-full">
        <div className="flex justify-between px-2 pb-2">
          <Label type="vibrant" icon={lightning}>
            {t("megaStore.month.sale")}
          </Label>
          <Label icon={SUNNYSIDE.icons.stopwatch} type="danger">
            {t("megaStore.timeRemaining", {
              timeRemaining: secondsToString(timeRemaining, {
                length: "medium",
                removeTrailingZeros: true,
              }),
            })}
          </Label>
        </div>
        <div className="flex flex-col p-2 pt-1 space-y-3 overflow-y-auto scrollable max-h-[300px]">
          <span className="text-xs pb-2">{t("megaStore.message")}</span>
          {/* Wearables */}
          <ItemsList
            itemsLabel="Wearables"
            type="wearables"
            items={megastore.wearables}
            onItemClick={handleClickItem}
          />
          {/* Collectibles */}
          <ItemsList
            itemsLabel="Collectibles"
            type="collectibles"
            items={megastore.collectibles}
            onItemClick={handleClickItem}
          />
        </div>

        <ModalOverlay
          show={!!selectedItem}
          onBackdropClick={() => setSelectedItem(null)}
        >
          <ItemDetail
            isVisible={isVisible}
            item={selectedItem}
            image={getItemImage(selectedItem)}
            buff={getItemBuffLabel(selectedItem)}
            isWearable={selectedItem ? isWearablesItem(selectedItem) : false}
            onClose={() => setSelectedItem(null)}
          />
        </ModalOverlay>
      </div>
    </CloseButtonPanel>
  );
};
