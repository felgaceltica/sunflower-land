import Decimal from "decimal.js-light";
import { isCollectibleBuilt } from "features/game/lib/collectibleBuilt";
import {
  getBudYieldBoosts,
  Resource,
} from "features/game/lib/getBudYieldBoosts";
import {
  BumpkinActivityName,
  trackActivity,
} from "features/game/types/bumpkinActivity";
import {
  FRUIT,
  FruitName,
  FRUIT_SEEDS,
  Fruit,
  GreenHouseFruitName,
} from "features/game/types/fruits";
import { Bumpkin, GameState, PlantedFruit } from "features/game/types/game";
import { getTimeLeft } from "lib/utils/time";
import { FruitPatch } from "features/game/types/game";
import { FruitCompostName } from "features/game/types/composters";
import { getPlantedAt } from "./fruitPlanted";
import { isWearableActive } from "features/game/lib/wearables";
import { isGreenhouseFruit } from "./plantGreenhouse";
import { FACTION_ITEMS } from "features/game/lib/factions";
import { produce } from "immer";

export type HarvestFruitAction = {
  type: "fruit.harvested";
  index: string;
};

type Options = {
  state: Readonly<GameState>;
  action: HarvestFruitAction;
  createdAt?: number;
};

export const isFruitReadyToHarvest = (
  createdAt: number,
  plantedFruit: PlantedFruit,
  fruitDetails: Fruit,
) => {
  const { seed } = FRUIT()[fruitDetails.name];
  const { plantSeconds } = FRUIT_SEEDS()[seed];

  return (
    createdAt -
      (plantedFruit.harvestedAt
        ? plantedFruit.harvestedAt
        : plantedFruit.plantedAt) >=
    plantSeconds * 1000
  );
};

type FruitYield = {
  name: FruitName | GreenHouseFruitName;
  game: GameState;
  fertiliser?: FruitCompostName;
};

export function isFruitGrowing(patch: FruitPatch) {
  const fruit = patch.fruit;
  if (!fruit) return false;

  const { name, amount, harvestsLeft, harvestedAt, plantedAt } = fruit;
  if (!harvestsLeft) return false;

  const { seed } = FRUIT()[name];
  const { plantSeconds } = FRUIT_SEEDS()[seed];

  if (harvestedAt) {
    const replenishingTimeLeft = getTimeLeft(harvestedAt, plantSeconds);
    if (replenishingTimeLeft > 0) return true;
  }

  const growingTimeLeft = getTimeLeft(plantedAt, plantSeconds);
  return growingTimeLeft > 0;
}

const isFruit = (resource: Resource): resource is FruitName => {
  return resource in FRUIT();
};

// Basic = Blueberry & Orange - Skill
const isBasicFruit = (resource: Resource): resource is FruitName => {
  return resource === "Blueberry" || resource === "Orange";
};

// Advanced = Apple, Banana - Skill
const isAdvancedFruit = (resource: Resource): resource is FruitName => {
  return resource === "Apple" || resource === "Banana";
};

export function getFruitYield({ name, game, fertiliser }: FruitYield) {
  const { bumpkin } = game;

  let amount = 1;

  if (name === "Apple" && isCollectibleBuilt({ name: "Lady Bug", game })) {
    amount += 0.25;
  }

  if (
    name === "Blueberry" &&
    isCollectibleBuilt({ name: "Black Bearry", game })
  ) {
    amount += 1;
  }

  if (isFruit(name) && isCollectibleBuilt({ name: "Macaw", game })) {
    amount += 0.1;
  }

  if (isFruit(name) && isWearableActive({ name: "Camel Onesie", game })) {
    amount += 0.1;
  }

  if (
    (name === "Apple" ||
      name === "Orange" ||
      name === "Blueberry" ||
      name === "Banana") &&
    isWearableActive({ name: "Fruit Picker Apron", game })
  ) {
    amount += 0.1;
  }

  if (bumpkin.skills["Red Sour"] && (name === "Tomato" || name === "Lemon")) {
    amount += 0.1;
  }

  if (bumpkin.skills["Fruitful Fumble"] && isBasicFruit(name)) {
    amount += 0.1;
  }

  if (bumpkin.skills["Tropical Orchard"] && isAdvancedFruit(name)) {
    amount += 0.1;
  }

  //Faction Quiver
  const factionName = game.faction?.name;
  if (
    factionName &&
    isWearableActive({
      game,
      name: FACTION_ITEMS[factionName].wings,
    })
  ) {
    amount += 0.25;
  }

  if (fertiliser === "Fruitful Blend") {
    amount += 0.1;
  }

  if (name === "Banana" && isWearableActive({ name: "Banana Amulet", game })) {
    amount += 0.5;
  }

  if (
    name === "Banana" &&
    isCollectibleBuilt({ name: "Banana Chicken", game })
  ) {
    amount += 0.1;
  }

  // Lemon
  if (name === "Lemon" && isCollectibleBuilt({ name: "Lemon Shark", game })) {
    amount += 0.2;
  }

  if (name === "Lemon" && isWearableActive({ name: "Lemon Shield", game })) {
    amount += 1;
  }

  if (
    name === "Lemon" &&
    isCollectibleBuilt({ name: "Reveling Lemon", game })
  ) {
    amount += 0.25;
  }

  if (
    name === "Tomato" &&
    isCollectibleBuilt({ name: "Tomato Bombard", game })
  ) {
    amount += 1;
  }

  if (name === "Grape" && isCollectibleBuilt({ name: "Vinny", game })) {
    // Grape
    amount += 0.25;
  }

  if (name === "Grape" && isCollectibleBuilt({ name: "Grape Granny", game })) {
    amount += 1;
  }

  if (name === "Grape" && isWearableActive({ name: "Grape Pants", game })) {
    amount += 0.2;
  }

  if (
    isGreenhouseFruit(name) &&
    isCollectibleBuilt({ name: "Pharaoh Gnome", game })
  ) {
    amount += 2;
  }

  amount += getBudYieldBoosts(game.buds ?? {}, name);

  return amount;
}

export function harvestFruit({
  state,
  action,
  createdAt = Date.now(),
}: Options): GameState {
  return produce(state, (stateCopy) => {
    const { fruitPatches, bumpkin, collectibles } = stateCopy;

    if (!bumpkin) {
      throw new Error("You do not have a Bumpkin!");
    }

    const patch = fruitPatches[action.index];

    if (!patch) {
      throw new Error("Fruit patch does not exist");
    }

    if (!patch.fruit) {
      throw new Error("Nothing was planted");
    }

    const { name, plantedAt, harvestsLeft, harvestedAt, amount } = patch.fruit;

    const { seed } = FRUIT()[name];
    const { plantSeconds } = FRUIT_SEEDS()[seed];

    if (createdAt - plantedAt < plantSeconds * 1000) {
      throw new Error("Not ready");
    }

    if (createdAt - harvestedAt < plantSeconds * 1000) {
      throw new Error("Fruit is still replenishing");
    }

    if (!harvestsLeft) {
      throw new Error("No harvest left");
    }

    stateCopy.inventory[name] =
      stateCopy.inventory[name]?.add(amount) ?? new Decimal(amount);

    patch.fruit.harvestsLeft = patch.fruit.harvestsLeft - 1;
    patch.fruit.harvestedAt = getPlantedAt(
      seed,
      (stateCopy.bumpkin as Bumpkin).equipped,
      stateCopy,
      createdAt,
    );

    patch.fruit.amount = getFruitYield({
      game: stateCopy,
      name,
      fertiliser: patch.fertiliser?.name,
    });

    const activityName: BumpkinActivityName = `${name} Harvested`;

    bumpkin.activity = trackActivity(activityName, bumpkin.activity);

    return stateCopy;
  });
}
