import React, { useContext, useState } from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import { GRID_WIDTH_PX, PIXEL_SCALE } from "features/game/lib/constants";
import { MachineState } from "features/game/lib/gameMachine";
import { Context } from "features/game/GameProvider";
import { useInterpret, useSelector } from "@xstate/react";
import { capitalize } from "lib/utils/capitalize";
import {
  animalMachine,
  AnimalMachineInterpreter,
  TState as AnimalMachineState,
} from "features/game/lib/animalMachine";
import {
  getAnimalFavoriteFood,
  getAnimalLevel,
  isAnimalFood,
} from "features/game/lib/animals";
import classNames from "classnames";
import { RequestBubble } from "features/game/expansion/components/animals/RequestBubble";
import { LevelProgress } from "features/game/expansion/components/animals/LevelProgress";
import { ANIMAL_EMOTION_ICONS } from "./Cow";
import {
  AnimalFoodName,
  AnimalMedicineName,
  InventoryItemName,
} from "features/game/types/game";
import { QuickSelect } from "features/greenhouse/QuickSelect";
import { Transition } from "@headlessui/react";
import { getKeys } from "features/game/types/craftables";
import { ANIMAL_FOODS } from "features/game/types/animals";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { ProduceDrops } from "features/game/expansion/components/animals/ProduceDrops";
import { useSound } from "lib/utils/hooks/useSound";
import { WakesIn } from "features/game/expansion/components/animals/WakesIn";
import { InfoPopover } from "features/island/common/InfoPopover";
import Decimal from "decimal.js-light";
import { REQUIRED_FOOD_QTY } from "features/game/events/landExpansion/feedAnimal";

const _animalState = (state: AnimalMachineState) =>
  // Casting here because we know the value is always a string rather than an object
  // This helps to be able to use the string as a key in the CHICKEN_STATES object
  state.value as AnimalMachineState["value"];

const _sheep = (id: string) => (state: MachineState) =>
  state.context.state.barn.animals[id];
const _inventory = (state: MachineState) => state.context.state.inventory;

export const Sheep: React.FC<{ id: string; disabled: boolean }> = ({
  id,
  disabled,
}) => {
  const { gameService, selectedItem } = useContext(Context);

  const sheep = useSelector(gameService, _sheep(id));

  const sheepService = useInterpret(animalMachine, {
    context: {
      animal: sheep,
    },
  }) as unknown as AnimalMachineInterpreter;

  const sheepState = useSelector(sheepService, _animalState);
  const inventory = useSelector(gameService, _inventory);

  const [showDrops, setShowDrops] = useState(false);
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [showWakesIn, setShowWakesIn] = useState(false);
  const [showNotEnoughFood, setShowNotEnoughFood] = useState(false);
  const [showNoMedicine, setShowNoMedicine] = useState(false);

  // Sounds
  const { play: playFeedAnimal } = useSound("feed_animal", true);
  const { play: playSheepCollect } = useSound("sheep_collect", true);
  const { play: playProduceDrop } = useSound("produce_drop");
  const { play: playLevelUp } = useSound("level_up");
  const { play: playCureAnimal } = useSound("cure_animal");
  const { t } = useAppTranslation();

  const favFood = getAnimalFavoriteFood("Sheep", sheep.experience);
  const sleeping = sheepState === "sleeping";
  const needsLove = sheepState === "needsLove";
  const ready = sheepState === "ready";
  const sick = sheepState === "sick";
  const idle = sheepState === "idle";

  const feedSheep = (item?: InventoryItemName) => {
    const updatedState = gameService.send({
      type: "animal.fed",
      animal: "Sheep",
      item: item ? (item as AnimalFoodName) : undefined,
      id: sheep.id,
    });

    const updatedSheep = updatedState.context.state.barn.animals[id];

    sheepService.send({
      type: "FEED",
      animal: updatedSheep,
    });

    playFeedAnimal();
  };

  const loveSheep = () => {
    const updatedState = gameService.send({
      type: "animal.loved",
      animal: "Sheep",
      id: sheep.id,
      item: "Petting Hand",
    });

    const updatedSheep = updatedState.context.state.barn.animals[id];

    sheepService.send({
      type: "LOVE",
      animal: updatedSheep,
    });
  };

  const claimProduce = () => {
    const updatedState = gameService.send({
      type: "produce.claimed",
      animal: "Sheep",
      id: sheep.id,
    });

    const updatedSheep = updatedState.context.state.barn.animals[id];

    sheepService.send({
      type: "CLAIM_PRODUCE",
      animal: updatedSheep,
    });
  };

  const cureSheep = (item?: InventoryItemName) => {
    const updatedState = gameService.send({
      type: "animal.fed",
      animal: "Sheep",
      item: item ? (item as AnimalMedicineName) : undefined,
      id: sheep.id,
    });

    const updatedSheep = updatedState.context.state.barn.animals[id];

    sheepService.send({
      type: "CURE",
      animal: updatedSheep,
    });
  };

  const onSickClick = async () => {
    const hasMedicineSelected = selectedItem === "Barn Delight";
    const medicineCount = inventory["Barn Delight"] ?? new Decimal(0);
    const hasEnoughMedicine = medicineCount.gte(1);

    if (hasMedicineSelected && hasEnoughMedicine) {
      playCureAnimal();
      cureSheep("Barn Delight");
      setShowQuickSelect(false);
    } else if (!hasMedicineSelected && hasEnoughMedicine) {
      setShowQuickSelect(true);
    } else {
      setShowNoMedicine(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowNoMedicine(false);
    }
    return;
  };

  const onReadyClick = async () => {
    setShowDrops(true);
    playProduceDrop();
    await new Promise((resolve) => setTimeout(resolve, 500));
    playSheepCollect();

    await new Promise((resolve) => setTimeout(resolve, 900));

    playLevelUp();
    claimProduce();
    setShowDrops(false);

    return;
  };

  const handleClick = async () => {
    if (disabled) return;

    if (needsLove) return loveSheep();

    if (sick) return onSickClick();

    if (sleeping) {
      setShowWakesIn((prev) => !prev);
      return;
    }

    if (ready) {
      // Already animating
      if (showDrops) return;
      return onReadyClick();
    }

    const hasFoodSelected = selectedItem && isAnimalFood(selectedItem);

    if (hasFoodSelected) {
      const foodCount =
        inventory[selectedItem as AnimalFoodName] ?? new Decimal(0);
      // 5 is the amount of food needed to feed the cow
      if (foodCount.lt(REQUIRED_FOOD_QTY.Sheep)) {
        setShowNotEnoughFood(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setShowNotEnoughFood(false);
        return;
      }

      feedSheep(selectedItem);
      setShowQuickSelect(false);

      return;
    }

    setShowQuickSelect(true);
  };

  const handleQuickSelect = async (item: InventoryItemName) => {
    if (sick) {
      setShowQuickSelect(false);
      // wait for quick select to close
      await new Promise((resolve) => setTimeout(resolve, 300));
      playCureAnimal();
      cureSheep(item);

      return;
    }

    const foodCount = inventory[item as AnimalFoodName] ?? new Decimal(0);

    if (foodCount.lt(REQUIRED_FOOD_QTY.Sheep)) {
      setShowQuickSelect(false);
      setShowNotEnoughFood(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowNotEnoughFood(false);
      return;
    }

    feedSheep(item);
    setShowQuickSelect(false);
  };

  const animalImageInfo = () => {
    if (ready) {
      return {
        image: SUNNYSIDE.animals.sheepReady,
        width: PIXEL_SCALE * 13,
      };
    }

    if (sleeping) {
      return {
        image: SUNNYSIDE.animals.sheepSleeping,
        width: PIXEL_SCALE * 13,
      };
    }

    if (sick) {
      return {
        image: SUNNYSIDE.animals.sheepSick,
        width: PIXEL_SCALE * 11,
      };
    }

    return {
      image: SUNNYSIDE.animals.sheepIdle,
      width: PIXEL_SCALE * 11,
    };
  };

  if (sheepState === "initial") return null;

  const level = getAnimalLevel(sheep.experience, "Sheep");

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        width: `${GRID_WIDTH_PX * 2}px`,
        height: `${GRID_WIDTH_PX * 2}px`,
      }}
      onMouseLeave={() => showWakesIn && setShowWakesIn(false)}
      onTouchEnd={() => showWakesIn && setShowWakesIn(false)}
    >
      <div className="relative w-full h-full">
        {showDrops && (
          <ProduceDrops
            currentLevel={level}
            animalType="Sheep"
            className="bottom-0 left-5 top-4"
          />
        )}
        <img
          // NOTE: Update to cow sleeping when available
          src={animalImageInfo().image}
          alt={`${capitalize(sheepState)} Sheep`}
          style={{
            width: `${PIXEL_SCALE * animalImageInfo().width}px`,
          }}
          onClick={handleClick}
          className={classNames(
            "absolute ml-[1px] mt-[2px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          )}
        />
        {/* Emotion */}
        {!idle && !needsLove && !sick && (
          <img
            src={ANIMAL_EMOTION_ICONS[sheepState].icon}
            alt={`${capitalize(sheepState)} Sheep`}
            style={{
              width: `${ANIMAL_EMOTION_ICONS[sheepState].width}px`,
              top: ANIMAL_EMOTION_ICONS[sheepState].top,
              right: ANIMAL_EMOTION_ICONS[sheepState].right,
            }}
            className="absolute"
          />
        )}
        {/* Request */}
        {idle && (
          <RequestBubble
            top={PIXEL_SCALE * 1}
            left={PIXEL_SCALE * 23}
            request={favFood}
            quantity={REQUIRED_FOOD_QTY.Sheep}
          />
        )}
        {sick && (
          <RequestBubble
            top={PIXEL_SCALE * 2}
            left={PIXEL_SCALE * 23}
            request="Barn Delight"
          />
        )}
        {needsLove && (
          <RequestBubble
            top={PIXEL_SCALE * 1}
            left={PIXEL_SCALE * 23}
            request={sheep.item}
          />
        )}
        {/* Level Progress */}
        <LevelProgress
          animal="Sheep"
          animalState={sheepState}
          experience={sheep.experience}
          className="bottom-3 left-1/2 transform -translate-x-1/2"
          // Don't block level up UI with wakes in panel if accidentally clicked
          onLevelUp={() => setShowWakesIn(false)}
        />
        {sleeping && showWakesIn && (
          <WakesIn asleepAt={sheep.asleepAt} className="-top-10" />
        )}
        {/* Not enough food */}
        {showNotEnoughFood && (
          <InfoPopover
            showPopover
            className="-top-12 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center">
              <p className="text-xs p-0.5 py-1 font-secondary">
                {t("animal.notEnoughFood")}
              </p>
            </div>
          </InfoPopover>
        )}
        {showNoMedicine && (
          <InfoPopover
            showPopover
            className="-top-12 left-1/2 transform -translate-x-1/2"
          >
            <p className="text-xs p-0.5 py-1 font-secondary">
              {t("animal.noMedicine")}
            </p>
          </InfoPopover>
        )}
      </div>
      {/* Quick Select */}
      <Transition
        appear={true}
        show={showQuickSelect}
        enter="transition-opacity  duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="flex top-[-20px] left-[50%] z-40 absolute"
      >
        <QuickSelect
          options={
            !sick
              ? getKeys(ANIMAL_FOODS)
                  .filter(
                    (food) =>
                      ANIMAL_FOODS[food].type === "food" &&
                      (inventory[food] ?? new Decimal(0)).gte(
                        REQUIRED_FOOD_QTY.Sheep,
                      ),
                  )
                  .map((food) => ({
                    name: food,
                    icon: food,
                    showSecondaryImage: false,
                  }))
              : [
                  {
                    name: "Barn Delight",
                    icon: "Barn Delight",
                    showSecondaryImage: false,
                  },
                ]
          }
          onClose={() => setShowQuickSelect(false)}
          onSelected={(item) => handleQuickSelect(item)}
          emptyMessage={t(sick ? "animal.noMedicine" : "animal.noFoodMessage")}
        />
      </Transition>
    </div>
  );
};
