import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { Player } from "features/world/types/Room";
import { NPC_WEARABLES } from "lib/npcs";

export type GoblinInvasionEnemyOptions = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  clothing: Player["clothing"];
  onClick?: () => void;
  onCollide?: () => void;
  name?: string;
  direction?: "left" | "right";
  level?: number;
};
export class GoblinInvasionEnemy extends BumpkinContainer {
  follower: any;
  path: Phaser.Curves.Path;
  level: number;
  constructor(scene: Phaser.Scene, level: number, path: Phaser.Curves.Path) {
    const options: GoblinInvasionEnemyOptions = {
      x: 0,
      y: 0,
      clothing: GoblinInvasionEnemy.getNPCClothing(level),
      scene: scene,
    };
    super(options);
    this.path = path;
    this.level = level;
    this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    this.startOnPath();
  }

  update(time: number, delta: number): void {
    // move the t point along the path, 0 is the start and 0 is the end
    this.follower.t += (this.level / 20000) * delta;

    // get the new x and y coordinates in vec
    this.path.getPoint(this.follower.t, this.follower.vec);
    if (this.follower.vec.x > this.x) {
      this.faceRight();
    } else if (this.follower.vec.x < this.x) {
      this.faceLeft();
    }
    // update enemy x and y to the newly obtained x and y
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
    // if we have reached the end of the path, remove the enemy
    if (this.follower.t >= 1) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  startOnPath(): void {
    // set the t parameter at the start of the path
    this.follower.t = 0;

    // get x and y of the given t point
    this.path.getPoint(this.follower.t, this.follower.vec);

    // set the x and y of our enemy to the received from the previous step
    this.setPosition(this.follower.vec.x, this.follower.vec.y);
  }

  private static getNPCClothing(level: number): any {
    switch (level) {
      case 1:
        return {
          ...NPC_WEARABLES.portaller,
          updatedAt: 0,
        };
        break;
      default:
        return {
          ...NPC_WEARABLES.portaller,
          updatedAt: 0,
        };
        break;
    }
  }
}
