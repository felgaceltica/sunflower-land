import React, { useContext, useEffect, useState } from "react";

import { SUNNYSIDE } from "assets/sunnyside";

import { ExpansionConstruction } from "features/game/types/game";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { Context } from "features/game/GameProvider";
import { ProgressBar } from "components/ui/ProgressBar";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Modal } from "components/ui/Modal";
import { Expanding } from "components/ui/layouts/ExpansionRequirements";
import { getInstantGems } from "features/game/events/landExpansion/speedUpRecipe";
import { gameAnalytics } from "lib/gameAnalytics";
import { Panel } from "components/ui/Panel";

interface Props {
  expansion: ExpansionConstruction;
  onDone: () => void;
}

/**
 * Goblins working hard constructing a piece of land
 */
export const Pontoon: React.FC<Props> = ({ expansion, onDone }) => {
  const { gameService } = useContext(Context);

  const { showTimers } = useContext(Context);

  const [showPopover, setShowPopover] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    (expansion.readyAt - Date.now()) / 1000,
  );
  const { t } = useAppTranslation();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = (expansion.readyAt - Date.now()) / 1000;
      setSecondsLeft(seconds);

      if (seconds <= 0) {
        clearInterval(interval);
        onDone();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onInstantExpand = () => {
    const readyAt =
      gameService.getSnapshot().context.state.expansionConstruction?.readyAt ??
      0;
    const gems = getInstantGems({
      readyAt: readyAt as number,
      game: gameService.getSnapshot().context.state,
    });

    gameService.send("expansion.spedUp");

    gameAnalytics.trackSink({
      currency: "Gem",
      amount: gems,
      item: "Instant Expand",
      type: "Fee",
    });

    setShowModal(false);
  };

  // Land is still being built
  const constructionTime = (expansion.readyAt - expansion.createdAt) / 1000;

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Panel>
          <Expanding
            onClose={() => setShowModal(false)}
            state={gameService.getSnapshot().context.state}
            onInstantExpanded={onInstantExpand}
          />
        </Panel>
      </Modal>
      <div
        onClick={() => setShowModal(true)}
        className="w-full h-full cursor-pointer"
      >
        <img
          src={SUNNYSIDE.land.pontoon}
          style={{
            top: `${PIXEL_SCALE * 20}px`,
            left: `${PIXEL_SCALE * -10}px`,
            width: `${PIXEL_SCALE * 129}px`,
          }}
          className="relative max-w-none"
        />

        {showTimers && (
          <ProgressBar
            seconds={secondsLeft}
            percentage={
              ((constructionTime - secondsLeft) / constructionTime) * 100
            }
            type="progress"
            formatLength="medium"
            style={{
              top: `${PIXEL_SCALE * 82}px`,
              left: `${PIXEL_SCALE * 45}px`,
              whiteSpace: "nowrap",
            }}
          />
        )}
      </div>
    </>
  );
};
