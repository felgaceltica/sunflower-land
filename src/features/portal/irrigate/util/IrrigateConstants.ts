import { Equipped } from "features/game/types/bumpkin";

export const MINIGAME_NAME = "irrigate";
//export const ZOOM = window.innerWidth < 500 ? 2 : 3;
export const UNLIMITED_ATTEMPTS_SFL = 3;
export const RESTOCK_ATTEMPTS_SFL = 1;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;
export type IrrigateNPCName = "Felga";
export const IRRIGATE_NPC_WEREABLES: Record<IrrigateNPCName, Equipped> = {
  Felga: {
    hair: "Basic Hair",
    shirt: "Skull Shirt",
    pants: "Farmer Pants",
    background: "Seashore Background",
    hat: "Feather Hat",
    body: "Beige Farmer Potion",
    shoes: "Yellow Boots",
    tool: "Farmer Pitchfork",
  },
};
