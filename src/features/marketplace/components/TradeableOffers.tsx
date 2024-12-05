import React, { useContext, useState } from "react";

import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { InnerPanel, Panel } from "components/ui/Panel";
import { Offer, TradeableDetails } from "features/game/types/marketplace";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

import sflIcon from "assets/icons/sfl.webp";
import increaseArrow from "assets/icons/increase_arrow.png";

import { OfferTable } from "./TradeTable";
import { Loading } from "features/auth/components";
import { Modal } from "components/ui/Modal";
import { useSelector } from "@xstate/react";
import { TradeableDisplay } from "../lib/tradeables";
import { getKeys } from "features/game/types/decorations";
import {
  BlockchainEvent,
  Context as ContextType,
  MachineState,
} from "features/game/lib/gameMachine";
import { useOnMachineTransition } from "lib/utils/hooks/useOnMachineTransition";
import { Context } from "features/game/GameProvider";
import { MakeOffer } from "./MakeOffer";
import * as Auth from "features/auth/lib/Provider";
import { AcceptOffer } from "./AcceptOffer";
import { AuthMachineState } from "features/auth/lib/authMachine";
import confetti from "canvas-confetti";
import { ResourceTable } from "./ResourceTable";
import { formatNumber } from "lib/utils/formatNumber";
import { getBasketItems } from "features/island/hud/components/inventory/utils/inventory";
import { KNOWN_ITEMS } from "features/game/types";
import { TRADE_LIMITS } from "features/game/actions/tradeLimits";
import { VIPAccess } from "features/game/components/VipAccess";
import { ModalContext } from "features/game/components/modal/ModalProvider";
import { hasVipAccess } from "features/game/lib/vipAccess";
import { useParams } from "react-router-dom";

// JWT TOKEN

const _hasPendingOfferEffect = (state: MachineState) =>
  state.matches("marketplaceOffering") || state.matches("marketplaceAccepting");
const _authToken = (state: AuthMachineState) =>
  state.context.user.rawToken as string;
const _balance = (state: MachineState) => state.context.state.balance;
const _inventory = (state: MachineState) => state.context.state.inventory;
const _isVIP = (state: MachineState) =>
  hasVipAccess(state.context.state.inventory);

export const TradeableOffers: React.FC<{
  tradeable?: TradeableDetails;
  farmId: number;
  display: TradeableDisplay;
  itemId: number;
  reload: () => void;
}> = ({ tradeable, farmId, display, itemId, reload }) => {
  const { authService } = useContext(Auth.Context);
  const { gameService, showAnimations } = useContext(Context);
  const { openModal } = useContext(ModalContext);
  const isVIP = useSelector(gameService, _isVIP);
  const { t } = useAppTranslation();
  const { id } = useParams();

  useOnMachineTransition<ContextType, BlockchainEvent>(
    gameService,
    "marketplaceOfferingSuccess",
    "playing",
    reload,
  );

  useOnMachineTransition<ContextType, BlockchainEvent>(
    gameService,
    "marketplaceOffering",
    "marketplaceOfferingSuccess",
    confetti,
  );

  const hasPendingOfferEffect = useSelector(
    gameService,
    _hasPendingOfferEffect,
  );
  const authToken = useSelector(authService, _authToken);
  const balance = useSelector(gameService, _balance);
  const inventory = useSelector(gameService, _inventory);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [showAcceptOffer, setShowAcceptOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();

  const topOffer = tradeable?.offers.reduce((highest, offer) => {
    return offer.sfl > highest.sfl ? offer : highest;
  }, tradeable?.offers[0]);

  useOnMachineTransition<ContextType, BlockchainEvent>(
    gameService,
    "marketplaceOfferCancellingSuccess",
    "playing",
    () => {
      reload();
      if (showAnimations) confetti();
    },
  );

  useOnMachineTransition<ContextType, BlockchainEvent>(
    gameService,
    "marketplaceAcceptingSuccess",
    "playing",
    reload,
  );

  const handleHide = () => {
    if (hasPendingOfferEffect) return;

    setShowMakeOffer(false);
  };

  const handleSelectOffer = (id: string) => {
    const selectedOffer = tradeable?.offers.find(
      (offer) => offer.tradeId === id,
    ) as Offer;

    setSelectedOffer(selectedOffer);
    setShowAcceptOffer(true);
  };

  const loading = !tradeable;
  const isResource = getKeys(TRADE_LIMITS).includes(KNOWN_ITEMS[Number(id)]);

  return (
    <>
      <Modal show={showMakeOffer} onHide={handleHide}>
        <Panel>
          <MakeOffer
            itemId={itemId}
            authToken={authToken}
            display={display}
            floorPrice={tradeable?.floor ?? 0}
            onClose={() => setShowMakeOffer(false)}
          />
        </Panel>
      </Modal>
      <Modal show={showAcceptOffer} onHide={handleHide}>
        <Panel>
          <AcceptOffer
            authToken={authToken}
            itemId={itemId}
            display={display}
            offer={(isResource ? selectedOffer : topOffer) as Offer}
            onClose={() => setShowAcceptOffer(false)}
            onOfferAccepted={reload}
          />
        </Panel>
      </Modal>
      {!isResource && (
        <InnerPanel className="mb-1">
          <div className="p-2 pb-0 mb-2">
            <div className="flex justify-between mb-2">
              <Label type="default" icon={increaseArrow}>
                {t("marketplace.offers")}
              </Label>
              <VIPAccess
                isVIP={isVIP}
                onUpgrade={() => {
                  openModal("BUY_BANNER");
                }}
                text={t("marketplace.unlockSelling")}
                labelType={!isVIP ? "danger" : undefined}
              />
            </div>
            <div className="flex items-center justify-between">
              {topOffer ? (
                <div className="flex items-center">
                  <img src={sflIcon} className="h-8 mr-2" />
                  <p className="text-base">{`${topOffer.sfl} SFL`}</p>
                </div>
              ) : !loading && tradeable?.offers.length === 0 ? (
                <p className="text-sm self-end mb-2 text-left">
                  {t("marketplace.noOffers")}
                </p>
              ) : (
                <div />
              )}
              {!loading && (
                <div className="flex items-center">
                  {tradeable?.isActive && (
                    <Button
                      className="w-full sm:w-fit mr-1"
                      disabled={!tradeable || !tradeable?.isActive}
                      onClick={() => setShowMakeOffer(true)}
                    >
                      {t("marketplace.makeOffer")}
                    </Button>
                  )}

                  {topOffer && tradeable?.isActive && (
                    <Button
                      onClick={() => setShowAcceptOffer(true)}
                      className="w-fit "
                    >
                      {t("marketplace.acceptOffer")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <Loading className="mb-2 ml-2" />
          ) : (
            <OfferTable
              details={display}
              offers={tradeable?.offers ?? []}
              id={farmId}
            />
          )}
        </InnerPanel>
      )}

      {isResource && (
        <InnerPanel className="mb-1">
          <div className="p-2">
            <div className="flex justify-between mb-2 mr-2">
              <Label type="default" icon={increaseArrow}>
                {t("marketplace.offers")}
              </Label>
              <VIPAccess
                isVIP={isVIP}
                onUpgrade={() => {
                  openModal("BUY_BANNER");
                }}
                text={t("marketplace.unlockSelling")}
                labelType={!isVIP ? "danger" : undefined}
              />
            </div>
            <div className="mb-2">
              {loading && <Loading />}
              {!loading && tradeable?.offers.length === 0 && (
                <p className="text-sm">{t("marketplace.noOffers")}</p>
              )}
              {!!tradeable?.offers.length && (
                <ResourceTable
                  itemName={KNOWN_ITEMS[Number(id)]}
                  balance={balance}
                  items={tradeable?.offers.map((offer) => ({
                    id: offer.tradeId,
                    price: offer.sfl,
                    quantity: offer.quantity,
                    pricePerUnit: Number(
                      formatNumber(offer.sfl / offer.quantity, {
                        decimalPlaces: 4,
                      }),
                    ),
                    createdBy: offer.offeredBy,
                  }))}
                  inventoryCount={
                    getBasketItems(inventory)[
                      KNOWN_ITEMS[itemId]
                    ]?.toNumber() ?? 0
                  }
                  id={farmId}
                  tableType="offers"
                  onClick={(offerId) => {
                    handleSelectOffer(offerId);
                    setShowAcceptOffer(true);
                  }}
                />
              )}
            </div>
          </div>
          <div className="w-full justify-end flex sm:pb-2 sm:pr-2">
            <Button
              className="w-full sm:w-fit"
              disabled={!tradeable}
              onClick={() => setShowMakeOffer(true)}
            >
              {t("marketplace.makeOffer")}
            </Button>
          </div>
        </InnerPanel>
      )}
    </>
  );
};
