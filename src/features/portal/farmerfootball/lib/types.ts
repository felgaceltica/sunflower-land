export interface Clothing {
  body: string;
  hat?: string;
  hair: string;
  shirt: string;
  pants: string;
  tool?: string;
}
import { Equipped } from "features/game/types/bumpkin";

export type NPCName = "RedTeamNPC" | "BlueTeamNPC" | "DonationNPC";
export const FARMER_FOOTBALL_NPCS: Record<NPCName, Equipped> = {
  RedTeamNPC: {
    body: "Goblin Potion",
    hat: undefined,
    hair: "Sun Spots",
    shirt: "Red Farmer Shirt",
    pants: "Farmer Pants",
    tool: "Goblin Axe",
    background: "Seashore Background",
    shoes: "Goblin Sabatons",
  },
  BlueTeamNPC: {
    body: "Beige Farmer Potion",
    hat: undefined,
    hair: "Sun Spots",
    shirt: "Blue Farmer Shirt",
    pants: "Farmer Pants",
    tool: "Farmer Pitchfork",
    background: "Seashore Background",
    shoes: "Black Farmer Boots",
  },
  DonationNPC: {
    body: "Light Brown Farmer Potion",
    shirt: "Pirate Leather Polo",
    hat: "Feather Hat",
    hair: "Sun Spots",
    tool: "Merch Coffee Mug",
    pants: "Farmer Pants",
    background: "Seashore Background",
    shoes: "Brown Boots",
  },
};
