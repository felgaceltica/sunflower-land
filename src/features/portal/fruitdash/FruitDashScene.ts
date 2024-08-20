import { FruitDashBaseScene } from "./lib/FruitDashBaseScene";
import { INITIAL_SPEED, INITIAL_WALK_SPEED } from "./util/FruitDashConstants";

export class FruitDashScene extends FruitDashBaseScene {
  constructor() {
    super();
  }

  preload() {
    super.preload();
  }
  async create() {
    super.create();
  }
  async update(time: number, delta: number) {
    super.update(time, delta);
    if (this.currentPlayer) {
      if (!this.isGamePlaying) {
        this.currentPlayer.visible = false;
        this.speed = INITIAL_SPEED;
        this.walkingSpeed = INITIAL_WALK_SPEED;
        if (this.isGameReady) {
          this.portalService?.send("START");
          this.currentPlayer.visible = true;
        }
      }
    }
  }
}
