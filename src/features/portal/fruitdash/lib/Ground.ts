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
import { FruitDashDecorationFactory } from "./Decorations";
import { FruitDashObstacleFactory } from "./Obstacles";
import weightedRandom from "../util/Utils";
import { hasFeatureAccess } from "lib/flags";

export class FruitDashGroundFactory {
  private _scene: FruitDashBaseScene;
  public dirtyTiles: number[] = [];
  public dirtyWeights: number[] = [];
  public grassTiles: number[] = [];
  public grassWeights: number[] = [];
  public fenceCount = 0;
  private streetLines: Phaser.GameObjects.Container[] = [];
  private backgroundLines: Phaser.GameObjects.Container[] = [];
  nextDecoration = 0; //randomInt(0, MAX_DECORATIONS_LINES);
  private _decorationsFactory: FruitDashDecorationFactory;
  nextObstacle: number = randomInt(0, MAX_OBSTACLES_LINES);
  private _obstaclesFactory: FruitDashObstacleFactory;
  private IS_HALLOWEEN = false;

  constructor(scene: FruitDashBaseScene) {
    this._scene = scene;
    this.IS_HALLOWEEN = hasFeatureAccess(
      this._scene.gameState,
      "FRUIT_DASH_HALLOWEEN",
    )
      ? true
      : false;
    this.dirtyTiles = this.IS_HALLOWEEN ? [117, 69, 121] : [449, 459, 522]; //[449, 457, 458, 459, 521, 522];
    this.dirtyWeights = [180, 1, 1]; //[180, 1, 1, 1, 1, 1];
    this.grassTiles = this.IS_HALLOWEEN
      ? [55, 4, 5, 6, 112]
      : [66, 129, 130, 131, 194, 199, 257, 258];
    this.grassWeights = this.IS_HALLOWEEN
      ? [250, 1, 1, 1, 1]
      : [250, 1, 1, 1, 1, 1, 1, 1];
    this._decorationsFactory = new FruitDashDecorationFactory(scene);
    this._obstaclesFactory = new FruitDashObstacleFactory(scene);
  }
  public preload() {
    if (this.IS_HALLOWEEN) {
      const texturehalloween = this._scene.textures.get("halloween_tileset");
      const textureimagehalloween: HTMLImageElement =
        texturehalloween.getSourceImage() as HTMLImageElement;
      this._scene.textures.addSpriteSheet(
        "SunnySideSpritesHalloween",
        textureimagehalloween,
        {
          frameWidth: 16,
          frameHeight: 16,
        },
      );
    }
    const texture = this._scene.textures.get("tileset");
    const textureimage: HTMLImageElement =
      texture.getSourceImage() as HTMLImageElement;
    this._scene.textures.addSpriteSheet("SunnySideSprites", textureimage, {
      frameWidth: 18,
      frameHeight: 18,
    });
    if (this.IS_HALLOWEEN) {
      this._scene.load.image(
        "oilpit_halloween",
        "world/fruitdash/oilpit_halloween.png",
      );
      this._scene.load.image(
        "tree_halloween",
        "world/fruitdash/tree_halloween.png",
      );
      this._scene.load.image("fence", "world/fruitdash/fence_halloween.png");
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
    } else {
      this._scene.load.image("fence", "world/fruitdash/fence.png");
    }
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
      if (this.IS_HALLOWEEN) {
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
      }
      image.setOrigin(0, 0);
      container.add(image);
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE * 1;
    const fenceLeft = this._scene.add.image(x, y, "fence");
    fenceLeft.setOrigin(0, 0);
    container.add(fenceLeft);
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const fenceRight = this._scene.add.image(x, y, "fence");
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
        }
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
    }
    if (this.nextDecoration < 0) {
      this.nextDecoration = 2; //randomInt(0, MAX_DECORATIONS_LINES);
      this._decorationsFactory.addRandomDecoration();
    }
    this._decorationsFactory.update(speed_factor);
  }
}
