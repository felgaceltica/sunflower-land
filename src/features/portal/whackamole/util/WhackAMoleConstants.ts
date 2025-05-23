import { Equipped } from "features/game/types/bumpkin";

export const MINIGAME_NAME = "minewhack";
//export const ZOOM = window.innerWidth < 500 ? 2 : 3;
export const UNLIMITED_ATTEMPTS_SFL = 3;
export const RESTOCK_ATTEMPTS_SFL = 1;
export const DAILY_ATTEMPTS = 5;
export const RESTOCK_ATTEMPTS = 3;
export type WhackAMoleNPCName = "WhackaMole";
export const WhackAMole_NPC_WEREABLES: Record<WhackAMoleNPCName, Equipped> = {
  WhackaMole: {
    hair: "Blacksmith Hair",
    //shirt: "Skull Shirt",
    pants: "Blue Suspenders",
    background: "Seashore Background",
    hat: "Grumpy Cat",
    body: "Beige Farmer Potion",
    shoes: "Yellow Boots",
    tool: "Grave Diggers Shovel",
    //dress: "Adventurer's Suit"
    //suit: ""
    //secondaryTool: ""
  },
};
