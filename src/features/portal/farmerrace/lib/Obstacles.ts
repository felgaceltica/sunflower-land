import { randomInt } from "lib/utils/random";
import {
  SQUARE_WIDTH_TEXTURE,
  START_HEIGHT,
  FINAL_HEIGHT,
  OBSTACLES_DEPTH,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
} from "../util/FarmerRaceConstants";
import weightedRandom from "../util/Utils";
import { FarmerRaceBaseScene } from "./FarmerRaceBaseScene";

export class FarmerRaceObstacleFactory {
  private _scene: FarmerRaceBaseScene;
  //private obstaclesMethods = [];
  private obstacles: any = {};
  private obstaclesLines: Phaser.GameObjects.Container[] = [];

  constructor(scene: FarmerRaceBaseScene) {
    this._scene = scene;
    //this.obstacles["turtle"] = new TurtleObstacle(10,10,false);
    // this.obstacles["stonewall"] = new StoneWallObstacle(10, 10, false);
    //this.obstacles["oilbarrel"] = new OilBarrelObstacle(20, 5, false);
    //this.obstacles["coin"] = new CoinObstacle(5,10,true);

    this.obstacles["rock"] = new RockObstacle(100, 5, false);
    this.obstacles["gravestone"] = new GraveStoneObstacle(100, 5.1, false);
    this.obstacles["oilpit"] = new OilPitObstacle(20, 20, false);
    this.obstacles["largerock"] = new StoneRockObstacle(20, 20, false);
    //Points
    this.obstacles["fruit"] = new FruitObstacle(40, 20, true);
    this.obstacles["bounty"] = new ChestObstacle(0, 250, true);
  }

  public addRandomObstacle(): void {
    const keys = Object.keys(this.obstacles) as Array<
      keyof typeof this.obstacles
    >;
    const weights: number[] = [];
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      weights.push(
        (this.obstacles[keys[index]] as FarmerRaceObstacle).getWeight(),
      );
    }

    const obstacleindex = weightedRandom(keys, weights)?.index;
    const obstacle = this.obstacles[
      keys[obstacleindex ? obstacleindex : 0]
    ] as FarmerRaceObstacle;
    const obstacleToInsert = obstacle.add(
      this._scene,
      keys[obstacleindex ? obstacleindex : 0] as string,
    );
    let intersects = false;
    for (let index = 0; index < this.obstaclesLines.length; index++) {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.obstaclesLines[index].getBounds(),
          obstacleToInsert.getBounds(),
        )
      ) {
        intersects = true;
      }
    }
    if (intersects) {
      obstacleToInsert.destroy();
    } else {
      this.obstaclesLines.push(obstacleToInsert);
    }
  }

  public update(f: number) {
    if (!this._scene.isGamePlaying) {
      this.obstaclesLines = this.obstaclesLines.filter(
        (item) => item.active == true,
      );
    } else {
      let currentScore = 0;
      if (this._scene.portalService?.state?.context?.score) {
        currentScore = this._scene.portalService?.state?.context?.score;
      }
      if (currentScore > 1000) {
        (this.obstacles["bounty"] as FarmerRaceObstacle).setWeight(0.1);
      } else {
        (this.obstacles["bounty"] as FarmerRaceObstacle).setWeight(0);
      }
    }
    for (let index = 0; index < this.obstaclesLines.length; index++) {
      if (!this._scene.isGamePlaying) {
        this.obstaclesLines[index].visible = false;
        this.obstaclesLines[index].destroy();
      } else {
        this.obstaclesLines[index].setDepth(OBSTACLES_DEPTH);
        this.obstaclesLines[index].y += this._scene.speed * f;

        if (this._scene.currentPlayer) {
          const playerrect = new Phaser.Geom.Rectangle(
            this._scene.currentPlayer.x -
              (this._scene.currentPlayer?.body as Phaser.Physics.Arcade.Body)
                .width *
                this._scene.currentPlayer.originX,
            this._scene.currentPlayer.y -
              (this._scene.currentPlayer?.body as Phaser.Physics.Arcade.Body)
                .height *
                this._scene.currentPlayer.originY,
            (
              this._scene.currentPlayer?.body as Phaser.Physics.Arcade.Body
            ).width,
            (
              this._scene.currentPlayer?.body as Phaser.Physics.Arcade.Body
            ).height,
          );

          const obstacle = this.obstaclesLines[
            index
          ] as FarmerRaceObstacleContainer;

          if (!obstacle.isProcessed()) {
            let collideWithPlayer = false;
            if (
              obstacle.getType() == "Rectangle" &&
              Phaser.Geom.Intersects.RectangleToRectangle(
                obstacle.getCollisionRect(),
                playerrect,
              )
            ) {
              if (this._scene.physics.world.drawDebug) {
                const graphics = this._scene.add.graphics({
                  lineStyle: { width: 1, color: 0xff0000 },
                  fillStyle: { color: 0xff0000 },
                });
                const obstaclerect = obstacle.getCollisionRect();
                graphics.strokeRectShape(obstaclerect);
                graphics.setDepth(1000);
                setTimeout(() => {
                  graphics.destroy();
                }, 1000);
              }
              collideWithPlayer = true;
            } else if (
              obstacle.getType() == "Circle" &&
              Phaser.Geom.Intersects.CircleToRectangle(
                obstacle.getCollisionCircle(),
                playerrect,
              )
            ) {
              if (this._scene.physics.world.drawDebug) {
                const graphics = this._scene.add.graphics({
                  lineStyle: { width: 1, color: 0xff0000 },
                  fillStyle: { color: 0xff0000 },
                });
                const obstaclecircle = obstacle.getCollisionCircle();
                graphics.strokeCircleShape(obstaclecircle);
                graphics.setDepth(1000);
                setTimeout(() => {
                  graphics.destroy();
                }, 1000);
              }
              collideWithPlayer = true;
            }
            if (collideWithPlayer) {
              if (obstacle.isBounty()) {
                obstacle.markProcessed();
                this._scene.tweens.add({
                  targets: obstacle,
                  alpha: 0,
                  ease: "Cubic.easeOut",
                  duration: 100,
                  repeat: 1,
                  yoyo: false,
                  onComplete: (item) => {
                    (item.targets[0] as FarmerRaceObstacleContainer).destroy();
                    //item.destroy();
                  },
                });
                if (obstacle.getName() == "bounty") {
                  this._scene.bountySound?.play({ volume: 0.3 });
                } else {
                  this._scene.fruitSound?.play({ volume: 0.3 });
                }
                this._scene.portalService?.send("GAIN_POINTS", {
                  points: obstacle.getPoints() * this._scene.speed,
                });
              } else {
                obstacle.markProcessed();
                if (this._scene.currentPlayer.visible) this.killPlayer();
              }
            }
          }
          if (
            obstacle.y >
            this._scene.currentPlayer?.y + SQUARE_WIDTH_TEXTURE * 1
          ) {
            if (!obstacle.isBounty() && !obstacle.isProcessed()) {
              obstacle.markProcessed();
              this._scene.portalService?.send("GAIN_POINTS", {
                points: obstacle.getPoints(),
              });
            }
          }
        }
        if (this.obstaclesLines[index].y > FINAL_HEIGHT) {
          this.obstaclesLines[index].visible = false;
          this.obstaclesLines[index].destroy();
        }
      }

      // this.obstaclesLines = this.obstaclesLines.filter(
      //   (item) => item.active == true,
      // );
    }
  }
  /**
   * Kills the player
   */
  private killPlayer = () => {
    if (!this._scene.currentPlayer?.body || !this._scene.isGamePlaying) {
      return;
    }

    // freeze player
    this._scene.currentPlayer.setVisible(false);
    this._scene.gameOverSound?.play({ volume: 0.3 });
    const spriteName = "player_death";
    const spriteKey = "player_death_anim";

    const playerDeath = this._scene.add.sprite(
      this._scene.currentPlayer.x,
      this._scene.currentPlayer.y - 1,
      spriteName,
    );
    playerDeath.setDepth(this._scene.currentPlayer.body.position.y);
    playerDeath.play({ key: spriteKey });
    this._scene.speed = 0;
    if (this._scene.currentPlayer.directionFacing === "left") {
      playerDeath.setFlipX(true);
    }

    playerDeath.on("animationcomplete", async () => {
      if (playerDeath.active) playerDeath.destroy();
      this._scene.portalService?.send("GAME_OVER");
    });
  };
}
class FarmerRaceObstacleContainer extends Phaser.GameObjects.Container {
  protected _weight: number;
  protected _points: number;
  protected _isBounty: boolean;
  protected _name: string;
  protected _type: "Circle" | "Rectangle" = "Rectangle";
  protected _isProcessed = false;
  protected _collisionShape?: Phaser.Geom.Rectangle | Phaser.Geom.Circle;
  constructor(
    scene: FarmerRaceBaseScene,
    x: number,
    y: number,
    weight: number,
    points: number,
    isBounty: boolean,
    name: string,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._weight = weight;
    this._points = points;
    this._isBounty = isBounty;
    this._name = name;
  }
  getWeight(): number {
    return this._weight;
  }
  getPoints(): number {
    return this._points;
  }
  isBounty(): boolean {
    return this._isBounty;
  }
  markProcessed() {
    this._isProcessed = true;
  }
  isProcessed(): boolean {
    return this._isProcessed;
  }
  getName(): string {
    return this._name;
  }
  getType(): "Circle" | "Rectangle" {
    return this._type;
  }
  setCollisionRect(collisionRect: Phaser.Geom.Rectangle) {
    this.x = getBaseX(collisionRect.x, collisionRect.width);
    this._collisionShape = collisionRect;
    this._type = "Rectangle";
  }
  setCollisionCircle(collisionCircle: Phaser.Geom.Circle) {
    this.x = getBaseX(
      collisionCircle.x - collisionCircle.radius,
      collisionCircle.radius * 2,
    );
    this._collisionShape = collisionCircle;
    this._type = "Circle";
  }
  getCollisionRect(): Phaser.Geom.Rectangle {
    if (this._collisionShape) {
      return new Phaser.Geom.Rectangle(
        this.x + this._collisionShape.x,
        this.y + this._collisionShape.y,
        (this._collisionShape as Phaser.Geom.Rectangle).width,
        (this._collisionShape as Phaser.Geom.Rectangle).height,
      );
    } else {
      return this.getBounds();
    }
  }
  getCollisionCircle(): Phaser.Geom.Circle {
    if (this._collisionShape) {
      return new Phaser.Geom.Circle(
        this.x + this._collisionShape.x,
        this.y + this._collisionShape.y,
        (this._collisionShape as Phaser.Geom.Circle).radius,
      );
    } else {
      return new Phaser.Geom.Circle(this.x, this.y, this.width / 2);
    }
  }
}
abstract class FarmerRaceObstacle {
  protected _weight: number;
  protected _points: number;
  protected _isBounty: boolean;
  constructor(weight: number, points: number, isBounty: boolean) {
    this._weight = weight;
    this._points = points;
    this._isBounty = isBounty;
  }
  abstract add(
    scene: FarmerRaceBaseScene,
    name: string,
  ): FarmerRaceObstacleContainer;
  getWeight(): number {
    return this._weight;
  }
  setWeight(wheight: number) {
    this._weight = wheight;
  }
}
class TurtleObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 3714);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 3715);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 3778);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      3779,
    );
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height);
    Phaser.Geom.Rectangle.Inflate(rect, -7, -7);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}
class OilBarrelObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 3317);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 3381);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(
      0.5,
      -2,
      bounds.width,
      bounds.height,
    );
    Phaser.Geom.Rectangle.Inflate(rect, -3, -7);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}

class GraveStoneObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    const image = scene.add.image(0, 0, "SunnySideSprites", 1004);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, -1, bounds.width, bounds.height);
    Phaser.Geom.Rectangle.Inflate(rect, -3, -3);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}

class StoneWallObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    const image = scene.add.image(0, 0, "SunnySideSprites", 109);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}

class StoneRockObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 1907);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 1908);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 1971);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      1972,
    );
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const shape = new Phaser.Geom.Circle(
      bounds.width / 2,
      bounds.height / 2,
      bounds.width / 2,
    );
    shape.radius = shape.radius * 0.7;
    //Phaser.Geom.Rectangle.Inflate(rect, -7, -2);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      graphics.strokeCircleShape(shape);
      graphics.strokeRectShape(bounds);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    const baseX = getBaseX(shape.x, shape.radius);
    container.setCollisionCircle(shape);
    return container;
  }
}

class OilPitObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      PLAYER_MIN_X,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 3443);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 3444);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 3507);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      3508,
    );
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const shape = new Phaser.Geom.Circle(
      bounds.width / 2,
      bounds.height / 2,
      bounds.width / 2,
    );
    shape.radius = shape.radius * 0.7;
    //Phaser.Geom.Rectangle.Inflate(rect, -7, -2);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      graphics.strokeCircleShape(shape);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionCircle(shape);
    return container;
  }
}

class RockObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    const image = scene.add.image(0, 0, "SunnySideSprites", 288);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height);
    Phaser.Geom.Rectangle.Inflate(rect, -3, -5);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      graphics.strokeRectShape(bounds);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}
class ChestObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    // let image = scene.add.image(0, 0, "SunnySideSprites", 1895);
    // image.setOrigin(0, 0);
    // container.add(image);
    let image = scene.add.image(0, 0, "SunnySideSprites", 1896);
    image.setOrigin(0, 0);
    container.add(image);
    // image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 1959);
    // image.setOrigin(0, 0);
    // container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 1960);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, 4, bounds.width, bounds.height);
    Phaser.Geom.Rectangle.Inflate(rect, -3, -12);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}
class CoinObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 3736);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 3800);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height);
    Phaser.Geom.Rectangle.Inflate(rect, -2, -7);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}
class FruitObstacle extends FarmerRaceObstacle {
  add(scene: FarmerRaceBaseScene, name: string): FarmerRaceObstacleContainer {
    const fruits = ["apple", "banana", "orange", "blueberry"];
    const container = new FarmerRaceObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._isBounty,
      name,
    );
    const image = scene.add.image(0, 0, fruits[randomInt(0, fruits.length)]);
    image.setOrigin(0, 0.2);
    container.add(image);
    const bounds = container.getBounds();
    const shape = new Phaser.Geom.Circle(
      bounds.width / 2,
      bounds.height / 2,
      bounds.width / 2,
    );
    shape.radius = shape.radius * 0.8;
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      graphics.strokeCircleShape(shape);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionCircle(shape);
    return container;
  }
}
function getBaseX(x: number, width: number): number {
  return randomInt(
    PLAYER_MIN_X - x - 5,
    PLAYER_MAX_X - x - width + SQUARE_WIDTH_TEXTURE / 2 - 4,
  );
}
