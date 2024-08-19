import { SUNNYSIDE } from "assets/sunnyside";
import { Equipped } from "features/game/types/bumpkin";
import { ITEM_DETAILS } from "features/game/types/images";

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
export const OBSTACLES_SCORE_TABLE: {
  [key: number]: {
    item: string;
    points: number;
    type: string;
  };
} = {
  0: {
    item: SUNNYSIDE.decorations.treasure_chest_opened,
    points: 250,
    type: "Bonus",
  },
  1: { item: ITEM_DETAILS["Apple"].image, points: 10, type: "Bonus" },
  2: { item: ITEM_DETAILS["Banana"].image, points: 10, type: "Bonus" },
  3: { item: ITEM_DETAILS["Orange"].image, points: 10, type: "Bonus" },
  4: { item: ITEM_DETAILS["Blueberry"].image, points: 10, type: "Bonus" },
  5: { item: ITEM_DETAILS["Oil Reserve"].image, points: 20, type: "Obstacle" },
  6: { item: SUNNYSIDE.resource.stone_rock, points: 20, type: "Obstacle" },
  7: { item: SUNNYSIDE.resource.stone_small, points: 20, type: "Obstacle" },
  8: {
    item: SUNNYSIDE.decorations.bonniesTombstone,
    points: 20,
    type: "Obstacle",
  },
};
export const MINIGAME_NAME = "farmer_race";
export const NAME_TAG_OFFSET_PX = 12;
export const MAX_OBSTACLES_LINES = 5;
export const MAX_DECORATIONS_LINES = 20;
export const INITIAL_SPEED = 1;
export const MAX_SPEED = 5;
export const SPEED_INCREMENT = 0.06;
export const INITIAL_WALK_SPEED = 70;
export const MAX_WALK_SPEED = 150;
export const WALK_SPEED_INCREMENT = 5;
export const BACKGROUND_SPEED_RATIO = 2;
export type FarmerRaceNPCName = "Felga";
export const FARMER_RACE_NPC_WEREABLES: Record<FarmerRaceNPCName, Equipped> = {
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
