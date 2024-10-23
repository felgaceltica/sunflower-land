import React, { useContext, useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { InnerPanel, Panel } from "components/ui/Panel";
import {
  CollectionName,
  Offer,
  TradeableDetails,
} from "features/game/types/marketplace";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

import sflIcon from "assets/icons/sfl.webp";
import tradeIcon from "assets/icons/trade.png";
import increaseArrow from "assets/icons/increase_arrow.png";

import { TradeTable } from "./TradeTable";
import { Loading } from "features/auth/components";
import { Modal } from "components/ui/Modal";
import { useSelector } from "@xstate/react";
import { TradeableDisplay } from "../lib/tradeables";
import { getOfferItem } from "../lib/offers";
import { getKeys } from "features/game/types/decorations";
import { RemoveOffer } from "./RemoveOffer";
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

// JWT TOKEN

const _hasPendingOfferEffect = (state: MachineState) =>
  state.matches("marketplaceOffering") || state.matches("marketplaceAccepting");
const _authToken = (state: AuthMachineState) =>
  state.context.user.rawToken as string;

export const TradeableOffers: React.FC<{
  tradeable?: TradeableDetails;
  farmId: number;
  display: TradeableDisplay;
  id: number;
  onOfferMade: () => void;
}> = ({ tradeable, farmId, display, id, onOfferMade }) => {
  const { authService } = useContext(Auth.Context);
  const { gameService } = useContext(Context);
  const { t } = useAppTranslation();

  useOnMachineTransition<ContextType, BlockchainEvent>(
    gameService,
    "marketplaceOfferingSuccess",
    "playing",
    onOfferMade,
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

  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [showAcceptOffer, setShowAcceptOffer] = useState(false);

  const topOffer = tradeable?.offers.reduce((highest, listing) => {
    return listing.sfl > highest.sfl ? listing : highest;
  }, tradeable?.offers?.[0]);

  const handleHide = () => {
    if (hasPendingOfferEffect) return;

    setShowMakeOffer(false);
  };

  return (
    <>
      <Modal show={showMakeOffer} onHide={handleHide}>
        <Panel>
          <MakeOffer
            id={id}
            authToken={authToken}
            tradeable={tradeable}
            display={display}
            onClose={() => setShowMakeOffer(false)}
          />
        </Panel>
      </Modal>
      <Modal show={showAcceptOffer} onHide={handleHide}>
        <Panel>
          <AcceptOffer
            authToken={authToken}
            id={id}
            tradeable={tradeable}
            display={display}
            offer={topOffer as Offer}
            onClose={() => setShowAcceptOffer(false)}
            onOfferAccepted={() => {
              onOfferMade();
            }}
          />
        </Panel>
      </Modal>
      {topOffer && (
        <InnerPanel className="mb-1">
          <div className="p-2">
            <div className="flex justify-between mb-2">
              <Label type="default" icon={increaseArrow}>
                {t("marketplace.topOffer")}
              </Label>
              <Label
                type="chill"
                icon={SUNNYSIDE.icons.player}
              >{`#${topOffer.offeredById}`}</Label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={sflIcon} className="h-8 mr-2" />
                <p className="text-base">{`${topOffer.sfl} SFL`}</p>
              </div>
              <Button
                onClick={() => setShowAcceptOffer(true)}
                className="w-fit"
              >
                {t("marketplace.acceptOffer")}
              </Button>
            </div>
          </div>
        </InnerPanel>
      )}

      <InnerPanel className="mb-1">
        <div className="p-2">
          <Label icon={tradeIcon} type="default" className="mb-2">
            {t("marketplace.offers")}
          </Label>
          <div className="mb-2">
            {!tradeable && <Loading />}
            {tradeable?.offers.length === 0 && (
              <p className="text-sm">{t("marketplace.noOffers")}</p>
            )}
            {!!tradeable?.offers.length && (
              <TradeTable
                items={tradeable.offers.map((offer) => ({
                  price: offer.sfl,
                  expiresAt: "30 days", // TODO,
                  createdById: offer.offeredById,
                  icon:
                    offer.offeredById === farmId
                      ? SUNNYSIDE.icons.player
                      : undefined,
                }))}
                id={farmId}
              />
            )}
          </div>
          <div className="w-full justify-end flex">
            <Button
              className="w-full sm:w-fit"
              onClick={() => setShowMakeOffer(true)}
            >
              {t("marketplace.makeOffer")}
            </Button>
          </div>
        </div>
      </InnerPanel>
    </>
  );
};

const _isCancellingOffer = (state: MachineState) =>
  state.matches("marketplaceCancelling");
const _trades = (state: MachineState) => state.context.state.trades;

export const YourOffer: React.FC<{
  onOfferRemoved: () => void;
  collection: CollectionName;
  id: number;
}> = ({ onOfferRemoved, collection, id }) => {
  const { t } = useAppTranslation();
  const { gameService } = useContext(Context);
  const { authService } = useContext(Auth.Context);

  const isCancellingOffer = useSelector(gameService, _isCancellingOffer);
  const trades = useSelector(gameService, _trades);
  const authToken = useSelector(authService, _authToken);

  const [showRemove, setShowRemove] = useState(false);

  useOnMachineTransition<ContextType, BlockchainEvent>(
    gameService,
    "marketplaceCancellingSuccess",
    "playing",
    onOfferRemoved,
  );

  const offers = trades.offers ?? {};

  const offerIds = getKeys(offers).filter((offerId) => {
    const offer = offers[offerId];
    const itemId = getOfferItem({ offer });

    if (offer.fulfilledAt) return false;

    // Make sure the offer is for this item
    return offer.collection === collection && itemId === id;
  });

  // Get their highest offer for the current item
  const myOfferId = offerIds.reduce((highest, offerId) => {
    const offer = offers[offerId];
    return offer.sfl > offers[highest].sfl ? offerId : highest;
  }, offerIds[0]);

  if (!myOfferId) return null;

  const offer = offers[myOfferId];

  const handleHide = () => {
    if (isCancellingOffer) return;

    setShowRemove(false);
  };

  return (
    <>
      <Modal show={!!showRemove} onHide={handleHide}>
        <RemoveOffer
          id={myOfferId as string}
          offer={offer}
          authToken={authToken}
          onClose={() => setShowRemove(false)}
        />
      </Modal>
      <InnerPanel className="mb-1">
        <div className="p-2">
          <div className="flex justify-between mb-2">
            <Label type="info" icon={increaseArrow}>
              {t("marketplace.yourOffer")}
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={sflIcon} className="h-8 mr-2" />
              <p className="text-base">{`${offer.sfl} SFL`}</p>
            </div>
            <Button className="w-fit" onClick={() => setShowRemove(true)}>
              {t("marketplace.cancelOffer")}
            </Button>
          </div>
        </div>
      </InnerPanel>
    </>
  );
};
