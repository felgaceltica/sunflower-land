import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Panel } from "components/ui/Panel";
import { Context } from "features/game/GameProvider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import React, { useContext, useState } from "react";
import { getTradeableDisplay } from "../lib/tradeables";
import { TradeableSummary } from "./TradeableSummary";
import { getListingCollection, getListingItem } from "../lib/listings";
import { useSelector } from "@xstate/react";
import { MachineState } from "features/game/lib/gameMachine";
import { MarketplaceTradeableName } from "features/game/types/marketplace";

const _trades = (state: MachineState) => state.context.state.trades;

interface Props {
  listingIds: string[];
  authToken: string;
  onClose: () => void;
}

export const RemoveListing: React.FC<Props> = ({
  listingIds,
  onClose,
  authToken,
}) => {
  const { t } = useAppTranslation();
  const { gameService } = useContext(Context);

  const [selectedListingId, setSelectedListingId] = useState<
    string | undefined
  >(listingIds.length === 1 ? listingIds[0] : undefined);

  const trades = useSelector(gameService, _trades);
  const listings = trades.listings ?? {};

  if (listingIds.length === 0) return null;

  if (!selectedListingId) {
    return (
      <Panel>
        <div className="p-2 pr-1">
          <Label type="danger" className="mb-2">
            {t("marketplace.cancelListing")}
          </Label>
          <p className="text-sm mb-2">
            {t("marketplace.cancelListing.selectListing")}
          </p>
          <div className="flex flex-col gap-2">
            {listingIds.map((listingId) => {
              const listing = listings[listingId];
              const display = getTradeableDisplay({
                id: getListingItem({ listing }),
                type: listing.collection,
              });
              return (
                <div className="flex justify-between" key={listingId}>
                  <TradeableSummary
                    display={display}
                    sfl={listing.sfl}
                    quantity={
                      listing.items[
                        display.name as MarketplaceTradeableName
                      ] as number
                    }
                  />
                  <div>
                    <Button onClick={() => setSelectedListingId(listingId)}>
                      {t("marketplace.cancelListing")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    );
  }

  const listing = listings[selectedListingId];

  const confirm = async () => {
    gameService.send("marketplace.listingCancelled", {
      effect: {
        type: "marketplace.listingCancelled",
        id: selectedListingId,
      },
      authToken,
    });

    onClose();
  };

  const itemId = getListingItem({ listing });
  const collection = getListingCollection({ listing });
  const display = getTradeableDisplay({ id: itemId, type: collection });

  return (
    <Panel>
      <div className="p-2">
        <Label type="danger" className="mb-2">
          {t("marketplace.cancelListing")}
        </Label>
        <p className="text-sm mb-2">
          {t("marketplace.cancelListing.areYouSure")}
        </p>
        <TradeableSummary
          display={display}
          sfl={listing.sfl}
          quantity={
            listing.items[display.name as MarketplaceTradeableName] as number
          }
        />
      </div>
      <div className="flex">
        <Button className="mr-1" onClick={onClose}>
          {t("no")}
        </Button>
        <Button onClick={confirm}>{t("yes")}</Button>
      </div>
    </Panel>
  );
};
