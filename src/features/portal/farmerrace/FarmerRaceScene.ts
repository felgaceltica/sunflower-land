import { FarmerRaceBaseScene } from "./lib/FarmerRaceBaseScene";
import { INITIAL_SPEED, INITIAL_WALK_SPEED } from "./util/FarmerRaceConstants";

export class FarmerRaceScene extends FarmerRaceBaseScene {
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
