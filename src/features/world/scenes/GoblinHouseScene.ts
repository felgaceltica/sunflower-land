import mapJSON from "assets/map/goblin_house.json";

import { SceneId } from "../mmoMachine";
import { BaseScene, NPCBumpkin } from "./BaseScene";

export const GOBLIN_HOUSE_NPCS: NPCBumpkin[] = [
  {
    // Trader
    x: 410,
    y: 200,
    npc: "glinteye",
    direction: "left",
  },
  {
    x: 57,
    y: 360,
    npc: "grizzle",
    direction: "right",
  },
  {
    x: 115,
    y: 249,
    npc: "chef tuck",
  },
];

export class GoblinHouseScene extends BaseScene {
  sceneId: SceneId = "goblin_house";

  constructor() {
    super({
      name: "goblin_house",
      map: { json: mapJSON },
      audio: { fx: { walk_key: "wood_footstep" } },
    });
  }

  preload() {
    super.preload();
  }

  create() {
    super.create();
    this.map = this.make.tilemap({
      key: "faction_house",
    });

    this.initialiseNPCs(GOBLIN_HOUSE_NPCS);
  }
}
