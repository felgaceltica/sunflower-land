import { SUNNYSIDE } from "assets/sunnyside";
import { Equipped } from "features/game/types/bumpkin";
import { ITEM_DETAILS } from "features/game/types/images";
import fisherHourglassFull from "assets/factions/boosts/fish_boost_full.webp";

export const ZOOM = window.innerWidth < 500 ? 3 : 4;
export const SQUARE_WIDTH_TEXTURE = 18;
export const STREET_COLUMNS = 6;
export const TOTAL_LINES =
  Math.ceil(window.innerHeight / SQUARE_WIDTH_TEXTURE / ZOOM) + 2;
export const START_HEIGHT =
  window.innerHeight / 2 - (TOTAL_LINES / 2) * SQUARE_WIDTH_TEXTURE;
export const FINAL_HEIGHT =
  window.innerHeight / 2 + (TOTAL_LINES / 2) * SQUARE_WIDTH_TEXTURE;
export const PLAYER_MIN_X =
  window.innerWidth / 2 -
  SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) +
  SQUARE_WIDTH_TEXTURE / 2;
export const PLAYER_MAX_X =
  window.innerWidth / 2 +
  SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
  SQUARE_WIDTH_TEXTURE / 2;
export const PLAYER_Y =
  window.innerHeight / 2 + SQUARE_WIDTH_TEXTURE * (TOTAL_LINES / 2 - 5);
export const TOTAL_COLUMNS = Math.ceil(
  window.innerWidth / SQUARE_WIDTH_TEXTURE / ZOOM,
);
export const GRASS_COLUMNS =
  Math.ceil((TOTAL_COLUMNS - STREET_COLUMNS) / 2) + 1;
export const GRASS_LEFT_MIN =
  window.innerWidth / 2 -
  SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
  SQUARE_WIDTH_TEXTURE * GRASS_COLUMNS;
export const GRASS_LEFT_MAX =
  GRASS_LEFT_MIN + SQUARE_WIDTH_TEXTURE * GRASS_COLUMNS;
export const GRASS_RIGHT_MIN =
  window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
export const GRASS_RIGHT_MAX =
  GRASS_RIGHT_MIN + SQUARE_WIDTH_TEXTURE * GRASS_COLUMNS;
export const GROUND_DEPTH = 50;
export const OBSTACLES_DEPTH = 100;
export const PLAYER_DEPTH = 200;
export const DECORATION_DEPTH = 200;
export const UNLIMITED_ATTEMPTS_SFL = 3;
export const RESTOCK_ATTEMPTS_SFL = 1;
export const DAILY_ATTEMPTS = 5;
export const BONUS_SCORE_TABLE: {
  [key: number]: {
    item: string;
    description: string;
  };
} = {
  0: {
    item: ITEM_DETAILS["Pirate Bounty"].image,
    description: "250 base points - Chance after 500 points",
  },
  1: { item: ITEM_DETAILS["Apple"].image, description: "20 base points" },
  2: { item: ITEM_DETAILS["Banana"].image, description: "20 base points" },
  3: { item: ITEM_DETAILS["Orange"].image, description: "20 base points" },
  4: { item: ITEM_DETAILS["Blueberry"].image, description: "20 base points" },
};

export const OBSTACLES_SCORE_TABLE: {
  [key: number]: {
    item: string;
    description: string;
  };
} = {
  0: { item: ITEM_DETAILS["Oil Reserve"].image, description: "5 points" },
  1: { item: SUNNYSIDE.resource.stone_rock, description: "5 points" },
  2: { item: SUNNYSIDE.resource.stone_small, description: "2 points" },
  3: {
    item: SUNNYSIDE.decorations.bonniesTombstone,
    description: "2 points",
  },
};
export const POWERUPS_SCORE_TABLE: {
  [key: number]: {
    item: string;
    description: string;
  };
} = {
  0: {
    item: fisherHourglassFull,
    description: "Decrease speed in 30% - Chance after 500 points",
    //description: "Slow down for 10 seconds - Chance after 500 points",
  },
};
export const SLOW_DOWN_DURATION = 10;
export const MINIGAME_NAME = "fruit_dash";
export const NAME_TAG_OFFSET_PX = 12;
export const MAX_OBSTACLES_LINES = 5;
export const MAX_DECORATIONS_LINES = 20;
export const INITIAL_SPEED = 1;
export const MAX_SPEED = 5;
export const SPEED_INCREMENT = 0.1;
export const INITIAL_WALK_SPEED = 70;
export const MAX_WALK_SPEED = 150;
export const WALK_SPEED_INCREMENT = 5;
export const BACKGROUND_SPEED_RATIO = 2;
export type FruitDashNPCName = "Felga";
export const FRUIT_DASH_NPC_WEREABLES: Record<FruitDashNPCName, Equipped> = {
  Felga: {
    hair: "Basic Hair",
    shirt: "Skull Shirt",
    pants: "Farmer Pants",
    background: "Seashore Background",
    necklace: "Green Amulet",
    hat: "Feather Hat",
    body: "Beige Farmer Potion",
    shoes: "Yellow Boots",
    tool: "Sunflower Rod",
  },
};
