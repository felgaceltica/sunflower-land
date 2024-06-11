import { SUNNYSIDE } from "assets/sunnyside";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import React, { useContext, useEffect, useState } from "react";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Context } from "features/game/GameProvider";
import { Context as AuthContext } from "features/auth/lib/Provider";
import { useActor } from "@xstate/react";

import tradeIcon from "assets/icons/trade.png";
import {
  FloorPrices,
  getListingsFloorPrices,
} from "features/game/actions/getListingsFloorPrices";
import { BuyPanel } from "./BuyPanel";
import { Trade } from "./Trade";
import { FactionEmblem } from "features/game/types/game";

interface Props {
  onClose: () => void;
  emblem: FactionEmblem;
}

export const EmblemsTrading: React.FC<Props> = ({ onClose, emblem }) => {
  const [tab, setTab] = useState(0);
  const { t } = useAppTranslation();

  const { gameService } = useContext(Context);
  const { authService } = useContext(AuthContext);
  const [authState] = useActor(authService);

  const [floorPrices, setFloorPrices] = useState<FloorPrices>({});

  const notCloseable = gameService.state.matches("fulfillTradeListing");

  useEffect(() => {
    const load = async () => {
      const floorPrices = await getListingsFloorPrices(
        authState.context.user.rawToken
      );
      setFloorPrices((prevFloorPrices) => ({
        ...prevFloorPrices,
        ...floorPrices,
      }));
    };
    load();
  }, []);

  return (
    <CloseButtonPanel
      onClose={notCloseable ? undefined : onClose}
      tabs={[
        { icon: SUNNYSIDE.icons.search, name: t("buy") },
        { icon: tradeIcon, name: t("sell") },
      ]}
      setCurrentTab={setTab}
      currentTab={tab}
    >
      {tab === 0 && <BuyPanel emblem={emblem} />}
      {tab === 1 && <Trade floorPrices={floorPrices} emblem={emblem} />}
    </CloseButtonPanel>
  );
};
