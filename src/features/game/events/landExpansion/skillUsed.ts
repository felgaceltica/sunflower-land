import {
  BumpkinRevampSkillName,
  BUMPKIN_REVAMP_SKILL_TREE,
  BumpkinSkillRevamp,
} from "features/game/types/bumpkinSkills";
import { getKeys } from "features/game/types/decorations";
import {
  GameState,
  CropPlot,
  Tree,
  GreenhousePot,
  FlowerBeds,
  OilReserve,
  Buildings,
} from "features/game/types/game";
import { produce } from "immer";
import { BUILDING_DAILY_OIL_CAPACITY } from "./supplyCookingOil";

export type SkillUseAction = {
  type: "skill.used";
  skill: BumpkinRevampSkillName;
};

type Options = {
  state: Readonly<GameState>;
  action: SkillUseAction;
  createdAt?: number;
};

function useInstantGrowth({ crops }: { crops: Record<string, CropPlot> }) {
  // Set each plot's plantedAt to 1 (making it grow instantly)
  getKeys(crops).forEach((plot) => {
    const plantedCrop = crops[plot].crop;
    if (plantedCrop) {
      plantedCrop.plantedAt = 1;
    }
  });

  return crops;
}

function useTreeBlitz({ trees }: { trees: Record<string, Tree> }) {
  getKeys(trees).forEach((tree) => {
    const { wood } = trees[tree];
    if (wood) {
      wood.choppedAt = 1;
    }
  });
  return trees;
}

function useGreenhouseGuru({
  greenhousePot,
}: {
  greenhousePot: Record<string, GreenhousePot>;
}) {
  getKeys(greenhousePot).forEach((pot) => {
    const { plant } = greenhousePot[pot];
    if (plant) {
      plant.plantedAt = 1;
    }
  });

  return greenhousePot;
}

function usePetalBlessed({ flowerBeds }: { flowerBeds: FlowerBeds }) {
  getKeys(flowerBeds).forEach((bed) => {
    const { flower } = flowerBeds[bed];
    if (flower) {
      flower.plantedAt = 1;
    }
  });
  return flowerBeds;
}

function useGreaseLightning({
  oilReserves,
}: {
  oilReserves: Record<string, OilReserve>;
}) {
  getKeys(oilReserves).forEach((reserve) => {
    const { oil } = oilReserves[reserve];
    if (oil) {
      oil.drilledAt = 1;
    }
  });
  return oilReserves;
}

function useInstantGratification({
  buildings,
  createdAt = Date.now(),
}: {
  buildings: Buildings;
  createdAt?: number;
}) {
  getKeys(BUILDING_DAILY_OIL_CAPACITY).forEach((building) => {
    const crafting = buildings[building]?.[0].crafting;

    if (crafting) {
      crafting.readyAt = createdAt;
    }
  });

  return buildings;
}

export function skillUse({ state, action, createdAt = Date.now() }: Options) {
  return produce(state, (stateCopy) => {
    const {
      bumpkin,
      crops,
      trees,
      greenhouse,
      flowers,
      oilReserves,
      buildings,
    } = stateCopy;

    const { skill } = action;

    const skillTree = BUMPKIN_REVAMP_SKILL_TREE[skill] as BumpkinSkillRevamp;

    const { requirements, power } = skillTree;

    if (bumpkin == undefined) {
      throw new Error("You do not have a Bumpkin");
    }

    if (bumpkin.skills[skill] == undefined) {
      throw new Error("You do not have this skill");
    }

    if (!power) {
      throw new Error("This skill does not have a power");
    }

    if (!bumpkin.previousPowerUseAt) {
      bumpkin.previousPowerUseAt = {};
    }

    if (bumpkin.previousPowerUseAt[skill]) {
      const { cooldown } = requirements;
      if (!cooldown) {
        throw new Error("This skill can only be used once");
      }

      const lastUse = bumpkin.previousPowerUseAt[skill] ?? 0;
      if (lastUse + cooldown > createdAt) {
        throw new Error("This skill is still under cooldown");
      }
    }

    // Skill is off cooldown, use it

    // TODO: Implement powers
    // Instant Growth
    if (skill === "Instant Growth") {
      stateCopy.crops = useInstantGrowth({ crops });
    }

    if (skill === "Tree Blitz") {
      stateCopy.trees = useTreeBlitz({ trees });
    }

    if (skill === "Greenhouse Guru") {
      stateCopy.greenhouse.pots = useGreenhouseGuru({
        greenhousePot: greenhouse.pots,
      });
    }

    if (skill === "Petal Blessed") {
      stateCopy.flowers.flowerBeds = usePetalBlessed({
        flowerBeds: flowers.flowerBeds,
      });
    }

    if (skill === "Grease Lightning") {
      stateCopy.oilReserves = useGreaseLightning({ oilReserves });
    }

    if (skill === "Instant Gratification") {
      stateCopy.buildings = useInstantGratification({ buildings, createdAt });
    }

    // Return the new state
    bumpkin.previousPowerUseAt[skill] = createdAt;

    return stateCopy;
  });
}
