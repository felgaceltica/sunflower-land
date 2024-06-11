export interface Clothing {
  body: string;
  hat?: string;
  hair: string;
  shirt: string;
  pants: string;
  tool?: string;
}
import { Equipped } from "features/game/types/bumpkin";

export type NPCName = "RedTeamNPC" | "BlueTeamNPC";
export const FARMER_SOCCER_NPCS: Record<NPCName, Equipped> = {
  RedTeamNPC: {
    body: "Goblin Potion",
    hat: "",
    hair: "Sun Spots",
    shirt: "Red Farmer Shirt",
    pants: "Farmer Pants",
    tool: "",
  },
  BlueTeamNPC: {
    body: "Beige Farmer Potion",
    hat: "",
    hair: "Sun Spots",
    shirt: "Blue Farmer Shirt",
    pants: "Farmer Pants",
    tool: "",
  },
};
