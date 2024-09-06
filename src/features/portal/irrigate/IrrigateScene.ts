import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME } from "./util/IrrigateConstants";
import { Netwalk } from "./lib/NetWalk";

export class IrrigateScene extends Phaser.Scene {
  sceneId: SceneId = MINIGAME_NAME;

  constructor() {
    super(MINIGAME_NAME);
  }

  preload() {
    //super.preload();
  }
  async create() {
    //super.create();
    this.newGame();
  }

  newGame() {
    new Netwalk({ rows: 3, columns: 3 });
  }

  // async update(time: number, delta: number) {

  // }
}
