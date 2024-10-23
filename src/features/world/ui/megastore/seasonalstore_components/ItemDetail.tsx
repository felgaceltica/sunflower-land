import React, { useContext, useLayoutEffect, useState } from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import { Label } from "components/ui/Label";
import Decimal from "decimal.js-light";
import { InventoryItemName, Keys } from "features/game/types/game";

import { Context } from "features/game/GameProvider";
import { useSelector } from "@xstate/react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { InnerPanel } from "components/ui/Panel";
import classNames from "classnames";
import { Button } from "components/ui/Button";
import { BuffLabel } from "features/game/types";
import { RequirementLabel } from "components/ui/RequirementsLabel";
import { gameAnalytics } from "lib/gameAnalytics";
import { MachineState } from "features/game/lib/gameMachine";
import {
  getCurrentSeason,
  // getSeasonalTicket,
} from "features/game/types/seasons";
import confetti from "canvas-confetti";
import { BumpkinItem } from "features/game/types/bumpkin";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  MEGASTORE,
  SeasonalStoreCollectible,
  SeasonalStoreItem,
  SeasonalStoreWearable,
} from "features/game/types/megastore";
import { getItemDescription } from "../SeasonalStore";
import { getKeys } from "features/game/types/craftables";
import { ARTEFACT_SHOP_KEYS } from "features/game/types/collectibles";

interface ItemOverlayProps {
  item: SeasonalStoreItem | null;
  image: string;
  isWearable: boolean;
  buff?: BuffLabel;
  tier?: "basic" | "rare" | "epic";
  isVisible: boolean;
  onClose: () => void;
  readonly?: boolean;
}

const _sflBalance = (state: MachineState) => state.context.state.balance;
const _inventory = (state: MachineState) => state.context.state.inventory;
const _wardrobe = (state: MachineState) => state.context.state.wardrobe;
const _keysBought = (state: MachineState) =>
  state.context.state.pumpkinPlaza.keysBought;

export const ItemDetail: React.FC<ItemOverlayProps> = ({
  item,
  tier,
  image,
  buff,
  isWearable,
  isVisible,
  onClose,
  readonly,
}) => {
  const { shortcutItem, gameService, showAnimations } = useContext(Context);
  const sflBalance = useSelector(gameService, _sflBalance);
  const inventory = useSelector(gameService, _inventory);
  const wardrobe = useSelector(gameService, _wardrobe);
  const keysBought = useSelector(gameService, _keysBought);

  const [imageWidth, setImageWidth] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [confirmBuy, setConfirmBuy] = useState<boolean>(false);

  const createdAt = Date.now();
  const currentSeason = getCurrentSeason(new Date(createdAt));
  const seasonalStore = MEGASTORE[currentSeason];
  const tiers =
    tier === "basic"
      ? "basic"
      : tier === "epic"
        ? "epic"
        : tier === "rare"
          ? "rare"
          : "basic";

  const tierItems =
    tiers === "basic"
      ? seasonalStore["basic"].items
      : tiers === "rare"
        ? seasonalStore["basic"].items
        : tiers === "epic"
          ? seasonalStore["rare"].items
          : seasonalStore["basic"].items;
  const seasonalCollectiblesCrafted = getKeys(inventory).filter((itemName) =>
    tierItems.some((items: SeasonalStoreItem) =>
      "collectible" in items ? items.collectible === itemName : false,
    ),
  ).length;
  const seasonalWearablesCrafted = getKeys(wardrobe).filter((itemName) =>
    tierItems.some((items: SeasonalStoreItem) =>
      "wearable" in items ? items.wearable === itemName : false,
    ),
  ).length;

  const seasonalItemsCrafted =
    seasonalCollectiblesCrafted + seasonalWearablesCrafted;

  const isRareUnlocked = seasonalItemsCrafted >= seasonalStore.rare.requirement;
  const isEpicUnlocked = seasonalItemsCrafted >= seasonalStore.epic.requirement;

  const itemName = item
    ? isWearable
      ? (item as SeasonalStoreWearable).wearable
      : (item as SeasonalStoreCollectible).collectible
    : undefined;

  const isKey = (name: InventoryItemName): name is Keys =>
    name in ARTEFACT_SHOP_KEYS;
  const keysBoughtAt = keysBought?.megastore[itemName as Keys]?.boughtAt;
  const keysBoughtToday =
    !!keysBoughtAt &&
    new Date(keysBoughtAt).toISOString().slice(0, 10) ===
      new Date().toISOString().slice(0, 10);

  const keysAmountBoughtToday = keysBoughtToday ? 1 : 0;

  const description = getItemDescription(item);
  const { sfl = 0 } = item?.cost || {};
  const itemReq = item?.cost?.items;

  useLayoutEffect(() => {
    if (isWearable) {
      setImageWidth(PIXEL_SCALE * 50);
      return;
    }

    const imgElement = new Image();

    imgElement.onload = function () {
      const trueWidth = imgElement.width;
      const scaledWidth = trueWidth * PIXEL_SCALE;

      setImageWidth(scaledWidth);
    };

    imgElement.src = image;
  }, []);

  const getBalanceOfItem = (item: SeasonalStoreItem | null): number => {
    if (!item) return 0;

    if (isWearable) {
      return (
        wardrobe[(item as SeasonalStoreWearable).wearable as BumpkinItem] ?? 0
      );
    }

    return (
      inventory[
        (item as SeasonalStoreCollectible).collectible as InventoryItemName
      ] ?? new Decimal(0)
    ).toNumber();
  };

  const canBuy = () => {
    if (!item) return false;

    if (keysBoughtToday) return false;
    if (tier !== "basic") {
      if (tier === "rare" && !isRareUnlocked) return false;
      if (tier === "epic" && !isEpicUnlocked) return false;
    }
    // if (item.currency === "SFL") {
    //   return sflBalance.greaterThanOrEqualTo(item.price);
    // }
    if (itemReq) {
      const hasRequirements = getKeys(itemReq).every((name) => {
        const amount = itemReq[name] || new Decimal(0);

        const count = inventory[name] || new Decimal(0);

        return count.gte(amount);
      });
      if (!hasRequirements) return false;
    }
    if (item) return sflBalance.greaterThanOrEqualTo(new Decimal(sfl));

    // const currency =
    //   item.currency === "Seasonal Ticket" ? getSeasonalTicket() : item.currency;
  };

  const trackAnalytics = () => {
    if (!item) return;
    const type = isWearable ? "Wearable" : "Collectible";
    const currency = "SFL";
    const itemName = isWearable
      ? ((item as SeasonalStoreWearable).wearable as BumpkinItem)
      : ((item as SeasonalStoreCollectible).collectible as InventoryItemName);

    gameAnalytics.trackSink({
      currency,
      amount: sfl,
      item: itemName,
      type,
    });

    if (!isWearable) {
      const itemName = (item as SeasonalStoreCollectible)
        .collectible as InventoryItemName;
      const count = inventory[itemName]?.toNumber() ?? 1;
      gameAnalytics.trackMilestone({
        event: `Crafting:Collectible:${itemName}${count}`,
      });
    }
  };
  const { t } = useAppTranslation();
  const handleBuy = () => {
    if (!item) return;

    gameService.send("seasonalItem.bought", {
      name: itemName,
      tier: tiers,
    });

    if (!isWearable) {
      shortcutItem(itemName as InventoryItemName);
    }

    if (showAnimations) confetti();
    trackAnalytics();
    setShowSuccess(true);
    setConfirmBuy(false);
  };

  const buttonHandler = () => {
    if (!confirmBuy) {
      setConfirmBuy(true);
      return;
    }

    handleBuy();
  };

  const getSuccessCopy = () => {
    if (isWearable) {
      return t("megaStore.wearable");
    }

    return t("megaStore.collectible");
  };
  const balanceOfItem = getBalanceOfItem(item);

  // const getLimitLabel = () => {
  //   if (!item?.limit) return;

  //   if (balanceOfItem >= item.limit) {
  //     return (
  //       <Label
  //         type="danger"
  //         className="absolute bottom-1 right-1 text-xxs"
  //       >{`${t("limit")}: ${balanceOfItem}/${item.limit}`}</Label> //t
  //     );
  //   }

  //   <span className="absolute bottom-1 right-2 text-xxs">{`${t(
  //     "limit",
  //   )}: ${balanceOfItem}/${item.limit}`}</span>; //t
  // };

  const getButtonLabel = () => {
    if (confirmBuy) return `${t("confirm")} ${t("buy")}`; //t

    return `${t("buy")} ${isWearable ? "wearable" : "collectible"}`;
  };

  // const currency =
  //   item?.currency === "Seasonal Ticket"
  //     ? getSeasonalTicket()
  //     : (item?.currency as InventoryItemName);

  return (
    <InnerPanel className="shadow">
      {isVisible && (
        <>
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center w-full">
              <div style={{ width: `${PIXEL_SCALE * 9}px` }} />
              <span className="flex-1 text-center">{itemName}</span>
              <img
                src={SUNNYSIDE.icons.close}
                className="cursor-pointer"
                onClick={onClose}
                style={{
                  width: `${PIXEL_SCALE * 9}px`,
                }}
              />
            </div>
            {!showSuccess && (
              <div className="w-full p-2 px-1">
                <div className="flex">
                  <div
                    className="w-[40%] relative min-w-[40%] rounded-md overflow-hidden shadow-md mr-2 flex justify-center items-center h-32"
                    style={
                      !isWearable
                        ? {
                            backgroundImage: `url(${SUNNYSIDE.ui.grey_background})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    <img
                      src={image}
                      alt={itemName}
                      className={"w-full"}
                      style={{
                        width: `${imageWidth}px`,
                      }}
                    />

                    {itemName && isKey(itemName as Keys) && (
                      <Label
                        type={keysBoughtToday ? "danger" : "default"}
                        className="absolute bottom-1 right-1 text-xxs"
                      >
                        {t("keys.dailyLimit", { keysAmountBoughtToday })}
                      </Label>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {!!buff && (
                      <div className="flex content-start flex-col sm:flex-row sm:flex-wrap gap-2">
                        <Label
                          type={buff.labelType}
                          icon={buff.boostTypeIcon}
                          secondaryIcon={buff.boostedItemIcon}
                        >
                          {buff.shortDescription}
                        </Label>
                      </div>
                    )}
                    <span className="text-xs leading-none">{description}</span>

                    {itemReq && (
                      <div className="flex flex-1 content-start flex-col flex-wrap">
                        {getKeys(itemReq).map((itemName, index) => {
                          return (
                            <RequirementLabel
                              key={index}
                              className={" "}
                              type="item"
                              item={itemName}
                              showLabel
                              balance={inventory[itemName] ?? new Decimal(0)}
                              requirement={new Decimal(itemReq[itemName] ?? 0)}
                            />
                          );
                        })}
                      </div>
                    )}
                    {item && sfl && (
                      <div className="flex flex-1 items-end">
                        {/* SFL */}
                        <RequirementLabel
                          type="sfl"
                          balance={sflBalance}
                          requirement={new Decimal(item.cost.sfl)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {!readonly && (
            <>
              {!showSuccess && (
                <div
                  className={classNames("flex w-full", {
                    "space-x-1": confirmBuy,
                  })}
                >
                  {confirmBuy && (
                    <Button onClick={() => setConfirmBuy(false)}>
                      {t("cancel")}
                    </Button>
                  )}

                  <Button
                    disabled={
                      !canBuy() ||
                      (itemName &&
                        isKey(itemName as InventoryItemName) &&
                        !!keysBoughtToday)
                    }
                    onClick={buttonHandler}
                  >
                    {getButtonLabel()}
                  </Button>
                </div>
              )}
              {showSuccess && (
                <div className="flex flex-col space-y-1">
                  <span className="p-2 text-xs">{getSuccessCopy()}</span>
                  <Button onClick={onClose}>{t("ok")}</Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </InnerPanel>
  );
};
