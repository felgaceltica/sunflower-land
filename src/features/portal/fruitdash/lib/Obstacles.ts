import { randomInt } from "lib/utils/random";
import {
  SQUARE_WIDTH_TEXTURE,
  START_HEIGHT,
  FINAL_HEIGHT,
  OBSTACLES_DEPTH,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  INITIAL_SPEED,
  INITIAL_WALK_SPEED,
  SQUARE_WIDTH_TEXTURE_HALLOWEEN,
} from "../util/FruitDashConstants";
import weightedRandom from "../util/Utils";
import { FruitDashBaseScene } from "./FruitDashBaseScene";
import { getAudioMutedSetting } from "lib/utils/hooks/useIsAudioMuted";
import { InventoryItemName } from "features/game/types/game";
import { hasFeatureAccess } from "lib/flags";

export class FruitDashObstacleFactory {
  private _scene: FruitDashBaseScene;
  //private obstaclesMethods = [];
  private obstacles: any = {};
  private obstaclesLines: Phaser.GameObjects.Container[] = [];
  private throwableLines: Phaser.GameObjects.Container[] = [];
  private IS_HALLOWEEN = false;

  constructor(scene: FruitDashBaseScene) {
    this._scene = scene;
    this.IS_HALLOWEEN = hasFeatureAccess(
      this._scene.gameState,
      "FRUIT_DASH_HALLOWEEN",
    )
      ? true
      : false;
    //this.obstacles["turtle"] = new TurtleObstacle(10,10,false);
    // this.obstacles["stonewall"] = new StoneWallObstacle(10, 10, false);
    //this.obstacles["oilbarrel"] = new OilBarrelObstacle(20, 5, false);
    //this.obstacles["coin"] = new CoinObstacle(5,10,true);

    if (this.IS_HALLOWEEN) {
      this.obstacles["oilpit"] = new OilPitHalloweenObstacle(20, 5, "obstacle");
      this.obstacles["rock"] = new RockObstacle(100, 2, "obstacle");
      this.obstacles["largerock"] = new StoneRockHalloweenObstacle(
        20,
        5,
        "obstacle",
      );
      this.obstacles["gravestonehalloween"] = new GraveStoneHalloweenObstacle(
        50,
        2,
        "obstacle",
      );
      this.obstacles["gravestone"] = new GraveStoneObstacle(50, 2, "obstacle");
      //Points
      this.obstacles["fruit"] = new FruitHalloweenObstacle(50, 20, "bounty");
    } else {
      this.obstacles["oilpit"] = new OilPitObstacle(20, 5, "obstacle");
      this.obstacles["rock"] = new RockObstacle(100, 2, "obstacle");
      this.obstacles["largerock"] = new StoneRockObstacle(20, 5, "obstacle");
      this.obstacles["gravestone"] = new GraveStoneObstacle(100, 2, "obstacle");
      //Points
      this.obstacles["fruit"] = new FruitObstacle(50, 20, "bounty");
    }
    //Points
    this.obstacles["bounty"] = new ChestObstacle(0, 250, "bounty");
    //PowerUps
    this.obstacles["slowdown"] = new SlowDownPowerUp(0, 0, "powerup");
    this.obstacles["ghost"] = new GhostPowerUp(2, 0, "powerup");
    this.obstacles["axe"] = new AxePowerUp(3, 0, "powerup");
  }

  public addRandomObstacle(): void {
    const keys = Object.keys(this.obstacles) as Array<
      keyof typeof this.obstacles
    >;
    const weights: number[] = [];
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      weights.push(
        (this.obstacles[keys[index]] as FruitDashObstacle).getWeight(),
      );
    }

    const obstacleindex = weightedRandom(keys, weights)?.index;
    const obstacle = this.obstacles[
      keys[obstacleindex ? obstacleindex : 0]
    ] as FruitDashObstacle;
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
    if (
      intersects ||
      (obstacleToInsert.getName() == "slowdown" && this._scene.slow_down) ||
      (obstacleToInsert.getName() == "ghost" && this._scene.ghost)
    ) {
      //console.log('destroy ' + obstacleToInsert.getName());
      obstacleToInsert.destroy();
    } else {
      this.obstaclesLines.push(obstacleToInsert);
    }
  }

  public throwAxe() {
    const obstacle = this.obstacles["axe"] as AxePowerUp;
    const obstacleToInsert = obstacle.addThorawble(this._scene, "axe", true);
    obstacleToInsert.x = this._scene.currentPlayer
      ? this._scene.currentPlayer?.x
      : 0;
    obstacleToInsert.y = this._scene.currentPlayer
      ? this._scene.currentPlayer?.y
      : 0;
    obstacleToInsert.list[0] as Phaser.GameObjects.Image;
    obstacleToInsert.setDepth(OBSTACLES_DEPTH);
    this._scene.tweens.add({
      targets: obstacleToInsert,
      angle: 360,
      ease: "Linear",
      duration: 2000,
      repeat: -1,
      yoyo: false,
    });
    this.throwableLines.push(obstacleToInsert);
  }

  public update(f: number) {
    if (!this._scene.isGamePlaying) {
      this.obstaclesLines = this.obstaclesLines.filter(
        (item) => item.active == true,
      );
      this.throwableLines = this.throwableLines.filter(
        (item) => item.active == true,
      );
      this._scene.tweens.killAll();
    } else {
      if (this._scene.slow_down || this._scene.ghost) {
        this.obstaclesLines.forEach((item) => {
          const obstacle = item as FruitDashObstacleContainer;
          if (obstacle.getName() == "slowdown" && this._scene.slow_down) {
            obstacle.markProcessed();
            obstacle.destroy();
          } else if (obstacle.getName() == "ghost" && this._scene.ghost) {
            obstacle.markProcessed();
            obstacle.destroy();
          }
        });
      }

      let currentScore = 0;
      if (this._scene.portalService?.state?.context?.score) {
        currentScore = this._scene.portalService?.state?.context?.score;
      }
      if (currentScore > 500) {
        (this.obstacles["bounty"] as FruitDashObstacle).setWeight(0.3);
        (this.obstacles["slowdown"] as FruitDashObstacle).setWeight(3);
      } else {
        (this.obstacles["bounty"] as FruitDashObstacle).setWeight(0);
        (this.obstacles["slowdown"] as FruitDashObstacle).setWeight(0);
      }
    }
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
        (this._scene.currentPlayer?.body as Phaser.Physics.Arcade.Body).width,
        (this._scene.currentPlayer?.body as Phaser.Physics.Arcade.Body).height,
      );
      for (let index = 0; index < this.throwableLines.length; index++) {
        if (!this._scene.isGamePlaying) {
          this.throwableLines[index].visible = false;
          this.throwableLines[index].destroy();
        } else {
          this.throwableLines[index].setDepth(OBSTACLES_DEPTH);
          this.throwableLines[index].y -= this._scene.speed * f;
          const throwableObstacle = this.throwableLines[
            index
          ] as FruitDashObstacleContainer;
          if (!throwableObstacle.isProcessed()) {
            for (
              let index1 = 0;
              index1 < this.obstaclesLines.length;
              index1++
            ) {
              let collideObstacle = false;
              const obstacle = this.obstaclesLines[
                index1
              ] as FruitDashObstacleContainer;
              if (!obstacle.isObstacle() || obstacle.isProcessed()) continue;
              if (
                obstacle.getType() == "Rectangle" &&
                Phaser.Geom.Intersects.CircleToRectangle(
                  throwableObstacle.getCollisionCircle(),
                  obstacle.getCollisionRect(),
                )
              ) {
                collideObstacle = true;
              } else if (
                obstacle.getType() == "Circle" &&
                Phaser.Geom.Intersects.CircleToCircle(
                  obstacle.getCollisionCircle(),
                  throwableObstacle.getCollisionCircle(),
                )
              ) {
                collideObstacle = true;
              }
              if (collideObstacle) {
                throwableObstacle.markProcessed();
                throwableObstacle.destroy();
                obstacle.markProcessed();
                this._scene.tweens.add({
                  targets: obstacle,
                  alpha: 0,
                  ease: "Cubic.easeOut",
                  duration: 100,
                  repeat: 1,
                  yoyo: false,
                  onComplete: (item) => {
                    (item.targets[0] as FruitDashObstacleContainer).destroy();
                    //item.destroy();
                  },
                });
              }
            }
          }

          if (this.throwableLines[index].y < START_HEIGHT) {
            this.throwableLines[index].visible = false;
            this.throwableLines[index].destroy();
          }
        }
      }
      for (let index = 0; index < this.obstaclesLines.length; index++) {
        if (!this._scene.isGamePlaying) {
          this.obstaclesLines[index].visible = false;
          this.obstaclesLines[index].destroy();
        } else {
          this.obstaclesLines[index].setDepth(OBSTACLES_DEPTH);
          this.obstaclesLines[index].y += this._scene.speed * f;
          const obstacle = this.obstaclesLines[
            index
          ] as FruitDashObstacleContainer;

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
                    (item.targets[0] as FruitDashObstacleContainer).destroy();
                    //item.destroy();
                  },
                });
                if (!getAudioMutedSetting()) {
                  if (obstacle.getName() == "Pirate Bounty") {
                    this._scene.bountySound?.play({ volume: 0.15 });
                  } else {
                    this._scene.fruitSound?.play({ volume: 0.15 });
                  }
                }
                this._scene.currentPlayer.react(
                  obstacle.getName() as InventoryItemName,
                  Math.round(obstacle.getPoints() * this._scene.speed),
                );
                this._scene.portalService?.send("GAIN_POINTS", {
                  points: obstacle.getPoints() * (this._scene.speed * 1.1),
                });
              } else if (obstacle.isObstacle() && !this._scene.ghost) {
                obstacle.markProcessed();
                if (this._scene.currentPlayer.visible) this.killPlayer();
              } else if (obstacle.isPowerUp()) {
                obstacle.markProcessed();
                this._scene.tweens.add({
                  targets: obstacle,
                  alpha: 0,
                  ease: "Cubic.easeOut",
                  duration: 100,
                  repeat: 1,
                  yoyo: false,
                  onComplete: (item) => {
                    (item.targets[0] as FruitDashObstacleContainer).destroy();
                    //item.destroy();
                  },
                });
                if (!getAudioMutedSetting()) {
                  this._scene.fruitSound?.play({ volume: 0.15 });
                }
                if (obstacle.getName() == "slowdown") {
                  this._scene.speed =
                    this._scene.speed - this._scene.speed * 0.2;
                  if (this._scene.speed < INITIAL_SPEED)
                    this._scene.speed = INITIAL_SPEED;
                  this._scene.walkingSpeed =
                    this._scene.walkingSpeed - this._scene.walkingSpeed * 0.2;
                  if (this._scene.walkingSpeed < INITIAL_WALK_SPEED)
                    this._scene.walkingSpeed = INITIAL_WALK_SPEED;
                  // this._scene.next_speed = this._scene.speed;
                  // this._scene.speed = INITIAL_SPEED;
                  // this._scene.slow_down = true;
                  // setTimeout(() => {
                  //   if (this._scene.slow_down) {
                  //     this._scene.speed = this._scene.next_speed;
                  //     this._scene.slow_down = false;
                  //   }
                  // }, SLOW_DOWN_DURATION * 1000);
                } else if (obstacle.getName() == "ghost") {
                  this._scene.ghost = true;
                  this._scene.tweens.add({
                    targets: this._scene.currentPlayer,
                    alpha: 0.3,
                    ease: "Cubic.easeOut",
                    duration: 500,
                    repeat: 8,
                    yoyo: true,
                    onComplete: (item) => {
                      this._scene.tweens.add({
                        targets: this._scene.currentPlayer,
                        alpha: 0.3,
                        ease: "Cubic.easeOut",
                        duration: 100,
                        repeat: 10,
                        yoyo: true,
                        onComplete: (item) => {
                          if (this._scene.currentPlayer && this._scene.ghost) {
                            this._scene.currentPlayer.alpha = 1;
                            this._scene.ghost = false;
                          }
                        },
                      });
                    },
                  });
                } else if (obstacle.getName() == "axe") {
                  this._scene.portalService?.send("COLLECT_AXE");
                  //this._scene.currentPlayer.react("Axe", this._scene.portalService?.state?.context?.axes);
                  this._scene.currentPlayer.react("Gold Pickaxe", 1);
                }
              }
            }
          }
          if (
            obstacle.y >
            this._scene.currentPlayer?.y + SQUARE_WIDTH_TEXTURE * 1
          ) {
            //console.log('O - ' + obstacle.isObstacle() + ' B - ' + obstacle.isBounty()+ ' P - ' + obstacle.isPowerUp())
            if (obstacle.isObstacle() && !obstacle.isProcessed()) {
              obstacle.markProcessed();
              this._scene.portalService?.send("GAIN_POINTS", {
                points: obstacle.getPoints(),
              });
            }
          }

          if (this.obstaclesLines[index].y > FINAL_HEIGHT) {
            this.obstaclesLines[index].visible = false;
            this.obstaclesLines[index].destroy();
          }
        }
      }
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
    if (!getAudioMutedSetting())
      this._scene.gameOverSound?.play({ volume: 0.15 });

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
class FruitDashObstacleContainer extends Phaser.GameObjects.Container {
  protected _weight: number;
  protected _points: number;
  protected _name: string;
  protected _geometry_type: "Circle" | "Rectangle" = "Rectangle";
  protected _type: string;
  protected _isProcessed = false;
  protected _collisionShape?: Phaser.Geom.Rectangle | Phaser.Geom.Circle;
  constructor(
    scene: FruitDashBaseScene,
    x: number,
    y: number,
    weight: number,
    points: number,
    type: string,
    name: string,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._weight = weight;
    this._points = points;
    this._type = type;
    this._name = name;
  }
  getWeight(): number {
    return this._weight;
  }
  getPoints(): number {
    return this._points;
  }
  isBounty(): boolean {
    return this._type == "bounty";
  }
  isObstacle(): boolean {
    return this._type == "obstacle";
  }
  isPowerUp(): boolean {
    return this._type == "powerup";
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
    return this._geometry_type;
  }
  setCollisionRect(collisionRect: Phaser.Geom.Rectangle) {
    this.x = getBaseX(collisionRect.x, collisionRect.width);
    this._collisionShape = collisionRect;
    this._geometry_type = "Rectangle";
  }
  setCollisionCircle(collisionCircle: Phaser.Geom.Circle) {
    this.x = getBaseX(
      collisionCircle.x - collisionCircle.radius,
      collisionCircle.radius * 2,
    );
    this._collisionShape = collisionCircle;
    this._geometry_type = "Circle";
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
abstract class FruitDashObstacle {
  protected _weight: number;
  protected _points: number;
  protected _type: string;
  constructor(weight: number, points: number, type: string) {
    this._weight = weight;
    this._points = points;
    this._type = type;
  }
  abstract add(
    scene: FruitDashBaseScene,
    name: string,
  ): FruitDashObstacleContainer;
  getWeight(): number {
    return this._weight;
  }
  setWeight(wheight: number) {
    this._weight = wheight;
  }
}
class TurtleObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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
class OilBarrelObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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

class GraveStoneObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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

class GraveStoneHalloweenObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE_HALLOWEEN * 3,
      this._weight,
      this._points,
      this._type,
      name,
    );
    let image = scene.add.image(0, 0, "SunnySideSpritesHalloween", 288);
    image.setScale((SQUARE_WIDTH_TEXTURE - 5) / SQUARE_WIDTH_TEXTURE_HALLOWEEN);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE - 5,
      "SunnySideSpritesHalloween",
      341,
    );
    image.setScale((SQUARE_WIDTH_TEXTURE - 5) / SQUARE_WIDTH_TEXTURE_HALLOWEEN);
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(
      -2,
      10,
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
    );
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

class StoneWallObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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

class StoneRockObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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

class StoneRockHalloweenObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE_HALLOWEEN * 3,
      this._weight,
      this._points,
      this._type,
      name,
    );
    const image = scene.add.image(0, 0, "tree_halloween");
    image.setOrigin(0, 0);
    container.add(image);
    const shape = new Phaser.Geom.Circle(
      SQUARE_WIDTH_TEXTURE - 2,
      SQUARE_WIDTH_TEXTURE - 5,
      SQUARE_WIDTH_TEXTURE,
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
    const baseX = getBaseX(shape.x, shape.radius);
    container.setCollisionCircle(shape);
    return container;
  }
}

class OilPitObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      PLAYER_MIN_X,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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

class OilPitHalloweenObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      PLAYER_MIN_X,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      name,
    );
    const image = scene.add.image(0, 0, "oilpit_halloween");
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

class RockObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT,
      this._weight,
      this._points,
      this._type,
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

class RockHalloweenObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT,
      this._weight,
      this._points,
      this._type,
      name,
    );
    const image = scene.add.sprite(0, 0, "SunnySideSpritesHalloween", 25);
    image.setOrigin(0, 0);
    container.add(image);
    image.play("pumpkim");
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(
      -1,
      1,
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
    );
    Phaser.Geom.Rectangle.Inflate(rect, -3, -5);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      graphics.strokeRectShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionRect(rect);
    return container;
  }
}
class ChestObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      "Pirate Bounty",
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
class SlowDownPowerUp extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      name,
    );
    const image = scene.add.image(0, 0, "slowdown");
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height);
    //Phaser.Geom.Rectangle.Inflate(rect, -2, -2);
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

class GhostPowerUp extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      name,
    );
    const image = scene.add.image(0, 0, "ghost");
    image.setOrigin(0, 0);
    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Circle(
      bounds.width / 2,
      bounds.height / 2,
      bounds.width / 2,
    );
    //Phaser.Geom.Rectangle.Inflate(rect, -2, -2);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeCircleShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionCircle(rect);
    return container;
  }
}

class AxePowerUp extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    return this.addThorawble(scene, name, false);
  }
  addThorawble(
    scene: FruitDashBaseScene,
    name: string,
    throwable: boolean,
  ): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      name,
    );
    const image = scene.add.image(0, 0, "axe");

    container.add(image);
    const bounds = container.getBounds();
    const rect = new Phaser.Geom.Circle(
      bounds.width / 2,
      bounds.height / 2,
      bounds.width / 2,
    );
    if (throwable) {
      // image.x = image.width / 2;
      // image.y = image.height / 2;
      // image.setOrigin(0.5, 0.5);
      rect.setPosition(0, 0);
      rect.radius = rect.radius * 1.3;
    } else {
      image.setOrigin(0, 0);
    }
    //Phaser.Geom.Rectangle.Inflate(rect, -2, -2);
    if (scene.physics.world.drawDebug) {
      const graphics = new Phaser.GameObjects.Graphics(scene, {
        lineStyle: { width: 1, color: 0xffff00 },
        fillStyle: { color: 0xff0000 },
      });
      //  Draw the now deflated rectangle in yellow
      graphics.lineStyle(1, 0xffff00);
      graphics.strokeCircleShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
    }
    container.setCollisionCircle(rect);
    return container;
  }
}

class CoinObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
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

class FruitHalloweenObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      "Pumpkin",
    );
    const image = scene.add.sprite(0, 0, "SunnySideSpritesHalloween", 25);
    image.setOrigin(0, 0);
    container.add(image);
    image.play("pumpkim");
    const bounds = container.getBounds();
    const shape = new Phaser.Geom.Circle(
      SQUARE_WIDTH_TEXTURE / 2 - 1,
      SQUARE_WIDTH_TEXTURE / 2,
      SQUARE_WIDTH_TEXTURE / 2,
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

class FruitObstacle extends FruitDashObstacle {
  add(scene: FruitDashBaseScene, name: string): FruitDashObstacleContainer {
    const fruits = ["Apple", "Banana", "Orange", "Blueberry"];
    const fruit = fruits[randomInt(0, fruits.length)];
    const container = new FruitDashObstacleContainer(
      scene,
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
      this._weight,
      this._points,
      this._type,
      fruit,
    );
    const image = scene.add.image(0, 0, fruit);
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
