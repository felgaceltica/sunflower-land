import { getAudioMutedSetting } from "lib/utils/hooks/useIsAudioMuted";
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
    if (this.currentPlayer) {
      if (!this.isGamePlaying) {
        this.currentPlayer.visible = false;
        this.slow_down = false;
        this.ghost = false;
        this.target = false;
        this.speed = INITIAL_SPEED;
        this.walkingSpeed = INITIAL_WALK_SPEED;
        if (this.isGameReady) {
          this.portalService?.send("START");
          this.currentPlayer.visible = true;
        }
      } else {
        let currentScore = 0;
        let targetScore = 0;
        if (this.portalService?.state?.context?.score) {
          currentScore = this.portalService?.state?.context?.score;
        }
        if (
          this.portalService?.state?.context?.state?.minigames.prizes[
            "fruit-dash"
          ]?.score
        ) {
          targetScore =
            this.portalService?.state?.context?.state?.minigames.prizes[
              "fruit-dash"
            ]?.score;
        }
        if (!this.target && currentScore >= targetScore) {
          this.target = true;
          if (!getAudioMutedSetting()) {
            if (this.bountySound?.isPlaying) this.bountySound?.stop();
            if (this.fruitSound?.isPlaying) this.fruitSound?.stop();
            this.targetReachedSound?.play({ volume: 0.8 });
          }
        }
      }
    }
    super.update(time, delta);
  }
}
