import { randomInt } from "lib/utils/random";
import {
  TOTAL_LINES,
  START_HEIGHT,
  SQUARE_WIDTH_TEXTURE,
  STREET_COLUMNS,
  GRASS_COLUMNS,
  FINAL_HEIGHT,
  GROUND_DEPTH,
  MAX_OBSTACLES_LINES,
  BACKGROUND_SPEED_RATIO,
} from "../util/FruitDashConstants";
import { FruitDashBaseScene } from "./FruitDashBaseScene";
import { FruitDashTreeFactory } from "./Trees";
import { FruitDashDecorationFactory } from "./Decorations";
import { FruitDashObstacleFactory } from "./Obstacles";
import weightedRandom from "../util/Utils";
import { getHalloweenModeSetting } from "../util/useIsHalloweenMode";
import { getIsTimedEvent } from "../util/useIsTimedEvent";
import { SUNNYSIDE } from "assets/sunnyside";

export class FruitDashGroundFactory {
  private _scene: FruitDashBaseScene;
  public dirtyTiles: number[] = [];
  public dirtyWeights: number[] = [];
  public grassTiles: number[] = [];
  public grassWeights: number[] = [];
  public fenceCount = 0;
  private streetLines: Phaser.GameObjects.Container[] = [];
  private backgroundLines: Phaser.GameObjects.Container[] = [];
  nextDecoration = randomInt(0, 5);
  nextTree = 0;
  private _decorationsFactory: FruitDashDecorationFactory;
  private _treesFactory: FruitDashTreeFactory;
  nextObstacle: number = randomInt(0, MAX_OBSTACLES_LINES);
  private _obstaclesFactory: FruitDashObstacleFactory;
  private IS_HALLOWEEN = false;
  private IS_CHRISTMAS = false;
  private IS_EASTER = false;

  constructor(scene: FruitDashBaseScene) {
    this._scene = scene;
    this.IS_HALLOWEEN = getHalloweenModeSetting();
    this.IS_CHRISTMAS = getIsTimedEvent("CHRISTMAS");
    this.IS_EASTER = getIsTimedEvent("EASTER");
    this.dirtyTiles = this.IS_HALLOWEEN ? [117, 69, 121] : [449, 459, 522]; //[449, 457, 458, 459, 521, 522];
    this.dirtyWeights = [180, 1, 1]; //[180, 1, 1, 1, 1, 1];
    this.grassTiles = this.IS_HALLOWEEN
      ? [55, 4, 5, 6, 112]
      : [66, 129, 130, 131, 194, 199, 257, 258];
    this.grassWeights = this.IS_HALLOWEEN
      ? [250, 1, 1, 1, 1]
      : [250, 1, 1, 1, 1, 1, 1, 1];
    this._decorationsFactory = new FruitDashDecorationFactory(scene);
    this._treesFactory = new FruitDashTreeFactory(scene);
    this._obstaclesFactory = new FruitDashObstacleFactory(scene);
  }
  public preload() {
    const texturehalloween = this._scene.textures.get("halloween_tileset");
    const textureimagehalloween: HTMLImageElement =
      texturehalloween.getSourceImage() as HTMLImageElement;
    if (!this._scene.textures.exists("SunnySideSpritesHalloween"))
      this._scene.textures.addSpriteSheet(
        "SunnySideSpritesHalloween",
        textureimagehalloween,
        {
          frameWidth: 16,
          frameHeight: 16,
        },
      );
    const texture = this._scene.textures.get("tileset");
    const textureimage: HTMLImageElement =
      texture.getSourceImage() as HTMLImageElement;
    if (!this._scene.textures.exists("SunnySideSprites"))
      this._scene.textures.addSpriteSheet("SunnySideSprites", textureimage, {
        frameWidth: 18,
        frameHeight: 18,
      });
    this._scene.load.image(
      "oilpit_halloween",
      "world/fruitdash/oilpit_halloween.png",
    );
    this._scene.load.image(
      "tree_halloween",
      "world/fruitdash/tree_halloween.png",
    );
    this._scene.load.image(
      "christmas_tree",
      "world/fruitdash/christmas/tree.png",
    );
    this._scene.load.image(
      "easter_tree",
      "world/fruitdash/easter/giant_carrot.png",
    );
    this._scene.load.image("easterbush", SUNNYSIDE.sfts.easterBush);
    this._scene.load.image("easterbushshadow", SUNNYSIDE.sfts.easterBushShadow);
    this._scene.load.image(
      "easterbunny",
      "src/assets/sfts/easter/easter_bunny.gif",
    );
    this._scene.load.image("snow", "world/fruitdash/christmas/snow.png");
    this._scene.load.image("snowman", "world/fruitdash/christmas/snowman.png");
    this._scene.load.image("crate", "world/fruitdash/christmas/crate.png");
    this._scene.load.image("crate1", "world/fruitdash/christmas/crate1.png");
    this._scene.load.image("white", "world/fruitdash/christmas/white.png");
    this._scene.load.image("border", "world/fruitdash/christmas/border.png");
    this._scene.load.image(
      "oilpit_christmas",
      "world/fruitdash/christmas/oilpit.png",
    );
    this._scene.load.image(
      "fence_christmas",
      "world/fruitdash/christmas/fence.png",
    );
    this._scene.load.image(
      "fence_christmas1",
      "world/fruitdash/christmas/fence1.png",
    );
    this._scene.load.image(
      "snowangel",
      "world/fruitdash/christmas/snowangel.png",
    );
    this._scene.load.image(
      "frozenduck",
      "world/fruitdash/christmas/frozenduck.png",
    );
    this._scene.load.image("candy", "world/fruitdash/christmas/candy.png");
    // this._scene.load.image("gift1", "world/fruitdash/christmas/gift1.png");
    // this._scene.load.image("gift2", "world/fruitdash/christmas/gift2.png");
    // this._scene.load.image("gift3", "world/fruitdash/christmas/gift3.png");
    this._scene.load.image(
      "fence_halloween",
      "world/fruitdash/fence_halloween.png",
    );
    this._scene.anims.create({
      key: "pumpkim",
      frames: this._scene.anims.generateFrameNames(
        "SunnySideSpritesHalloween",
        {
          start: 23,
          end: 25,
        },
      ),
      repeat: -1,
      duration: 2000,
    });

    this._scene.load.image("fence", "world/fruitdash/fence.png");
  }

  public createBaseRoad() {
    for (let index = 0; index < TOTAL_LINES; index++) {
      this.addBaseRoadLine(START_HEIGHT + SQUARE_WIDTH_TEXTURE * index);
      this.addRoadLine(START_HEIGHT + SQUARE_WIDTH_TEXTURE * index, false);
      this.addBaseBackgroundLine(START_HEIGHT + SQUARE_WIDTH_TEXTURE * index);
      this.addBackgroundLine(
        START_HEIGHT + SQUARE_WIDTH_TEXTURE * index,
        false,
      );
    }
  }
  public throwAxe() {
    this._obstaclesFactory.throwAxe();
  }
  private addBaseRoadLine(startY: number) {
    const container = this._scene.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    for (let index = 0; index < STREET_COLUMNS; index++) {
      let image = this._scene.add.image(x, y, "SunnySideSprites", 449);
      if (this.IS_HALLOWEEN || this.IS_CHRISTMAS) {
        image = this._scene.add.image(x, y, "SunnySideSpritesHalloween", 117);
        image.setScale(
          SQUARE_WIDTH_TEXTURE / image.width,
          SQUARE_WIDTH_TEXTURE / image.height,
        );
      }
      image.setOrigin(0, 0);
      container.add(image);
      x = x + SQUARE_WIDTH_TEXTURE;
    }
  }
  private addRoadLine(startY: number, start: boolean) {
    const container = this._scene.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    for (let index = 0; index < STREET_COLUMNS; index++) {
      const item = weightedRandom(this.dirtyTiles, this.dirtyWeights)?.item;
      if (item != 449 && item != 117) {
        let image = this._scene.add.image(x, y, "SunnySideSprites", item);
        if (this.IS_HALLOWEEN || this.IS_CHRISTMAS) {
          image = this._scene.add.image(
            x,
            y,
            "SunnySideSpritesHalloween",
            item,
          );
          image.setScale(
            SQUARE_WIDTH_TEXTURE / image.width,
            SQUARE_WIDTH_TEXTURE / image.height,
          );
        }
        image.setOrigin(0, 0);
        container.add(image);
      }
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE;
    let imageLeft = this._scene.add.image(x, y, "SunnySideSprites", 454);
    if (this.IS_HALLOWEEN) {
      imageLeft = this._scene.add.image(x, y, "SunnySideSpritesHalloween", 115);
      imageLeft.setScale(
        SQUARE_WIDTH_TEXTURE / imageLeft.width,
        SQUARE_WIDTH_TEXTURE / imageLeft.height,
      );
    } else if (this.IS_CHRISTMAS) {
      imageLeft = this._scene.add.image(x, y, "border");
      imageLeft.setScale(
        SQUARE_WIDTH_TEXTURE / imageLeft.width,
        SQUARE_WIDTH_TEXTURE / imageLeft.height,
      );
    }

    imageLeft.setOrigin(0, 0);
    container.add(imageLeft);
    if (this.fenceCount == 3) {
      let fenceLeft = this._scene.add.image(x, y, "SunnySideSprites", 233);
      if (this.IS_HALLOWEEN) {
        fenceLeft = this._scene.add.image(
          x,
          y,
          "SunnySideSpritesHalloween",
          1389,
        );
        fenceLeft.setScale(
          SQUARE_WIDTH_TEXTURE / fenceLeft.width,
          SQUARE_WIDTH_TEXTURE / fenceLeft.height,
        );
      } else if (this.IS_CHRISTMAS) {
        fenceLeft = this._scene.add.image(x, y, "fence_christmas");
        fenceLeft.setScale(
          SQUARE_WIDTH_TEXTURE / fenceLeft.width,
          SQUARE_WIDTH_TEXTURE / fenceLeft.height,
        );
      }
      fenceLeft.setOrigin(0, 0);
      container.add(fenceLeft);
    }
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    let imageRight = this._scene.add.image(x, y, "SunnySideSprites", 515);
    if (this.IS_HALLOWEEN) {
      imageRight = this._scene.add.image(
        x,
        y,
        "SunnySideSpritesHalloween",
        119,
      );
      imageRight.setScale(
        SQUARE_WIDTH_TEXTURE / imageRight.width,
        SQUARE_WIDTH_TEXTURE / imageRight.height,
      );
    } else if (this.IS_CHRISTMAS) {
      imageRight = this._scene.add.image(x, y, "border");
      imageRight.setFlipX(true);
      imageRight.setScale(
        SQUARE_WIDTH_TEXTURE / imageRight.width,
        SQUARE_WIDTH_TEXTURE / imageRight.height,
      );
    }
    imageRight.setOrigin(0, 0);
    container.add(imageRight);
    if (this.fenceCount == 3) {
      let fenceRight = this._scene.add.image(x, y, "SunnySideSprites", 233);
      if (this.IS_HALLOWEEN) {
        fenceRight = this._scene.add.image(
          x,
          y,
          "SunnySideSpritesHalloween",
          1389,
        );
      } else if (this.IS_CHRISTMAS) {
        fenceRight = this._scene.add.image(x, y, "fence_christmas");
        fenceRight.setScale(
          SQUARE_WIDTH_TEXTURE / fenceRight.width,
          SQUARE_WIDTH_TEXTURE / fenceRight.height,
        );
      }
      fenceRight.setOrigin(0, 0);
      container.add(fenceRight);
      this.fenceCount = -1;
    }
    this.fenceCount++;
    if (start) this.streetLines.unshift(container);
    else this.streetLines.push(container);
  }
  private addBaseBackgroundLine(startY: number) {
    const container = this._scene.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE;
    for (let index = 0; index < GRASS_COLUMNS; index++) {
      let image = this._scene.add.image(x, y, "SunnySideSprites", 66);
      if (this.IS_HALLOWEEN) {
        image = this._scene.add.image(x, y, "SunnySideSpritesHalloween", 55);
        image.setScale(
          SQUARE_WIDTH_TEXTURE / image.width,
          SQUARE_WIDTH_TEXTURE / image.height,
        );
      } else if (this.IS_CHRISTMAS) {
        image = this._scene.add.image(x, y, "white");
        image.setScale(
          SQUARE_WIDTH_TEXTURE / image.width,
          SQUARE_WIDTH_TEXTURE / image.height,
        );
      }

      image.setOrigin(0, 0);
      container.add(image);
      x = x - SQUARE_WIDTH_TEXTURE;
    }
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    for (let index = 0; index < GRASS_COLUMNS; index++) {
      let image = this._scene.add.image(x, y, "SunnySideSprites", 66);
      if (this.IS_HALLOWEEN) {
        image = this._scene.add.image(x, y, "SunnySideSpritesHalloween", 55);
        image.setScale(
          SQUARE_WIDTH_TEXTURE / image.width,
          SQUARE_WIDTH_TEXTURE / image.height,
        );
      } else if (this.IS_CHRISTMAS) {
        image = this._scene.add.image(x, y, "white");
        image.setScale(
          SQUARE_WIDTH_TEXTURE / image.width,
          SQUARE_WIDTH_TEXTURE / image.height,
        );
      }
      image.setOrigin(0, 0);
      container.add(image);
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE * 1;
    let fenceLeft = this._scene.add.image(x, y, "fence");
    if (this.IS_CHRISTMAS) {
      fenceLeft = this._scene.add.image(x, y, "fence_christmas1");
      fenceLeft.setScale(
        SQUARE_WIDTH_TEXTURE / fenceLeft.width,
        SQUARE_WIDTH_TEXTURE / fenceLeft.height,
      );
    }
    fenceLeft.setOrigin(0, 0);
    container.add(fenceLeft);
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    let fenceRight = this._scene.add.image(x, y, "fence");
    if (this.IS_CHRISTMAS) {
      fenceRight = this._scene.add.image(x, y, "fence_christmas1");
      fenceRight.setScale(
        SQUARE_WIDTH_TEXTURE / fenceRight.width,
        SQUARE_WIDTH_TEXTURE / fenceRight.height,
      );
    }
    fenceRight.setOrigin(0, 0);
    container.add(fenceRight);
  }
  private addBackgroundLine(startY: number, start: boolean) {
    const container = this._scene.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE * 2;
    for (let index = 1; index < GRASS_COLUMNS - 1; index++) {
      const item = weightedRandom(this.grassTiles, this.grassWeights)?.item;
      if (item != 66 && item != 55) {
        let image = this._scene.add.image(x, y, "SunnySideSprites", item);
        if (this.IS_HALLOWEEN) {
          image = this._scene.add.image(
            x,
            y,
            "SunnySideSpritesHalloween",
            item,
          );
          image.setScale(
            SQUARE_WIDTH_TEXTURE / image.width,
            SQUARE_WIDTH_TEXTURE / image.height,
          );
        } else if (this.IS_CHRISTMAS) {
          const snowimage = weightedRandom(
            ["snow", "snowman", "snowangel"],
            [50, 1, 1],
          )?.item;
          image = this._scene.add.image(x, y, snowimage);
          image.setScale(
            SQUARE_WIDTH_TEXTURE / image.width,
            SQUARE_WIDTH_TEXTURE / image.height,
          );
        }
        image.setOrigin(0, 0);
        container.add(image);
      }
      x = x - SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 +
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) +
      SQUARE_WIDTH_TEXTURE;
    for (let index = 1; index < GRASS_COLUMNS; index++) {
      const item = weightedRandom(this.grassTiles, this.grassWeights)?.item;
      if (item != 66 && item != 55) {
        let image = this._scene.add.image(x, y, "SunnySideSprites", item);
        if (this.IS_HALLOWEEN) {
          image = this._scene.add.image(
            x,
            y,
            "SunnySideSpritesHalloween",
            item,
          );
          image.setScale(
            SQUARE_WIDTH_TEXTURE / image.width,
            SQUARE_WIDTH_TEXTURE / image.height,
          );
        } else if (this.IS_CHRISTMAS) {
          const snowimage = weightedRandom(
            ["snow", "snowman", "snowangel"],
            [20, 1, 1],
          )?.item;
          image = this._scene.add.image(x, y, snowimage);
          image.setScale(
            SQUARE_WIDTH_TEXTURE / image.width,
            SQUARE_WIDTH_TEXTURE / image.height,
          );
        }
        // else if (this.IS_EASTER && item == 258) {
        //   //129, 130, 131, 194, 199, 257, 258
        //   const easterimage = weightedRandom(
        //     ["easterbush", "easterbunny"],
        //     [1, 25],
        //   )?.item;
        //   image = this._scene.add.image(x, y, easterimage);
        //   if(easterimage == "easterbush"){
        //     image.setScale(
        //       SQUARE_WIDTH_TEXTURE / image.width * 1.5,
        //       SQUARE_WIDTH_TEXTURE / image.height * 1.5,
        //     );
        //   }
        //   else{
        //     image.setScale(
        //       SQUARE_WIDTH_TEXTURE / image.width,
        //       SQUARE_WIDTH_TEXTURE / image.height,
        //     );
        //   }
        // }
        image.setOrigin(0, 0);
        container.add(image);
      }
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    if (start) this.backgroundLines.unshift(container);
    else this.backgroundLines.push(container);
  }
  public update(speed_factor: number) {
    for (let index = 0; index < this.streetLines.length; index++) {
      this.streetLines[index].setDepth(GROUND_DEPTH);
      this.streetLines[index].y += this._scene.speed * speed_factor;
    }

    const lastLine = this.streetLines[this.streetLines.length - 1];
    if (lastLine.y > FINAL_HEIGHT) {
      this.streetLines.splice(-1);
      lastLine.destroy();
      this.addRoadLine(this.streetLines[0].y - SQUARE_WIDTH_TEXTURE, true);
      this.nextObstacle--;
    }
    if (this._scene.isGamePlaying) {
      if (this.nextObstacle < 0) {
        this.nextObstacle = randomInt(0, MAX_OBSTACLES_LINES);
        this._obstaclesFactory.addRandomObstacle();
      }
    }
    this._obstaclesFactory.update(speed_factor);

    for (let index = 0; index < this.backgroundLines.length; index++) {
      this.backgroundLines[index].setDepth(GROUND_DEPTH - 1);
      this.backgroundLines[index].y +=
        (this._scene.speed / BACKGROUND_SPEED_RATIO) * speed_factor;
    }

    const lastLineBG = this.backgroundLines[this.streetLines.length - 1];
    if (lastLineBG.y > FINAL_HEIGHT) {
      this.backgroundLines.splice(-1);
      lastLineBG.destroy();
      this.addBackgroundLine(
        this.backgroundLines[0].y - SQUARE_WIDTH_TEXTURE,
        true,
      );
      this.nextDecoration--;
      this.nextTree--;
    }
    if (this.nextTree < 0) {
      this.nextTree = this.IS_CHRISTMAS ? 5 : 2; //randomInt(0, MAX_DECORATIONS_LINES);
      this._treesFactory.addRandomDecoration();
    }
    this._treesFactory.update(speed_factor);
    if (this.nextDecoration < 0) {
      this.nextDecoration = this.IS_EASTER ? randomInt(8, 20) : 0;
      this._decorationsFactory.addRandomDecoration();
    }
    this._decorationsFactory.update(speed_factor);
  }
}
