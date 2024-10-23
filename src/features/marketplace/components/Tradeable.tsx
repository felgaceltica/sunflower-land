import {
  CollectionName,
  TradeableDetails,
} from "features/game/types/marketplace";
import React, { useContext, useEffect, useState } from "react";
import * as Auth from "features/auth/lib/Provider";
import { useActor } from "@xstate/react";
import { useNavigate, useParams } from "react-router-dom";
import { loadTradeable } from "../actions/loadTradeable";
import { getTradeableDisplay } from "../lib/tradeables";

import { PriceHistory } from "./PriceHistory";
import { TradeableOffers, YourOffer } from "./TradeableOffers";
import { Context } from "features/game/GameProvider";
import { KNOWN_ITEMS } from "features/game/types";
import {
  getChestBuds,
  getChestItems,
} from "features/island/hud/components/inventory/utils/inventory";
import { ITEM_NAMES } from "features/game/types/bumpkin";
import { availableWardrobe } from "features/game/events/landExpansion/equip";
import { TradeableHeader } from "./TradeableHeader";
import { TradeableInfo } from "./TradeableInfo";
import { TradeableListings } from "./TradeableListings";

export const Tradeable: React.FC = () => {
  const { authService } = useContext(Auth.Context);
  const [authState] = useActor(authService);
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const farmId = gameState.context.farmId;
  const authToken = authState.context.user.rawToken as string;

  const { collection, id } = useParams<{
    collection: CollectionName;
    id: string;
  }>();
  const navigate = useNavigate();

  const [tradeable, setTradeable] = useState<TradeableDetails | null>();
  const [showListItem, setShowListItem] = useState(false);

  const display = getTradeableDisplay({
    id: Number(id),
    type: collection as CollectionName,
  });

  let count = 0;

  const game = gameState.context.state;
  if (display.type === "collectibles") {
    const name = KNOWN_ITEMS[tradeable?.id as number];
    count = getChestItems(game)[name]?.toNumber() ?? 0;
  }

  if (display.type === "wearables") {
    const name = ITEM_NAMES[tradeable?.id as number];
    count = availableWardrobe(game)[name] ?? 0;
  }

  if (display.type === "buds") {
    count = getChestBuds(game)[tradeable?.id as number] ? 1 : 0;
  }

  const load = async () => {
    try {
      setTradeable(undefined);

      const data = await loadTradeable({
        type: collection as CollectionName,
        id: Number(id),
        token: authState.context.user.rawToken as string,
      });

      setTradeable(data);
    } catch {
      setTradeable(null);
    }
  };

  useEffect(() => {
    load();
  }, [gameState.value === "loading"]);

  // TODO 404 view
  if (tradeable === null) {
    return <p>{`404`}</p>;
  }

  const onBack = () => {
    navigate(`/marketplace/${collection}`);
  };

  return (
    <div className="flex sm:flex-row flex-col w-full scrollable overflow-y-auto h-full overflow-x-none pr-1 pb-8">
      <div className="flex flex-col w-full sm:w-1/3 mr-1 mb-1">
        <div className="block sm:hidden">
          <TradeableHeader
            authToken={authToken}
            farmId={farmId}
            collection={collection as CollectionName}
            display={display}
            count={count}
            tradeable={tradeable}
            onBack={onBack}
            onPurchase={load}
            onListClick={() => setShowListItem(true)}
          />
        </div>

        <TradeableInfo display={display} tradeable={tradeable} />
      </div>
      <div className="w-full">
        <div className="hidden sm:block">
          <TradeableHeader
            authToken={authToken}
            farmId={farmId}
            collection={collection as CollectionName}
            display={display}
            tradeable={tradeable}
            count={count}
            onBack={onBack}
            onPurchase={load}
            onListClick={() => setShowListItem(true)}
          />
        </div>

        <YourOffer
          onOfferRemoved={load}
          collection={collection as CollectionName}
          id={Number(id)}
        />

        <PriceHistory history={tradeable?.history} />

        <TradeableListings
          id={Number(id)}
          authToken={authState.context.user.rawToken as string}
          tradeable={tradeable}
          display={display}
          farmId={farmId}
          collection={collection as CollectionName}
          showListItem={showListItem}
          count={count}
          onListing={load}
          onListClick={() => {
            setShowListItem(true);
          }}
          onListClose={() => {
            setShowListItem(false);
          }}
        />

        <TradeableOffers
          id={Number(id)}
          tradeable={tradeable}
          display={display}
          farmId={farmId}
          onOfferMade={load}
        />
      </div>
    </div>
  );
};
