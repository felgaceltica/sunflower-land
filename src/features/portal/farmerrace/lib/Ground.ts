import { randomInt } from "lib/utils/random";
import {
  TOTAL_LINES,
  START_HEIGHT,
  SQUARE_WIDTH_TEXTURE,
  STREET_COLUMNS,
  GRASS_COLUMNS,
  FINAL_HEIGHT,
  GROUND_DEPTH,
  MAX_DECORATIONS_LINES,
  MAX_OBSTACLES_LINES,
  BACKGROUND_SPEED_RATIO,
} from "../util/FarmerRaceConstants";
import { FarmerRaceBaseScene } from "./FarmerRaceBaseScene";
import { FarmerRaceDecorationFactory } from "./Decorations";
import { FarmerRaceObstacleFactory } from "./Obstacles";
import weightedRandom from "../util/Utils";

export class FarmerRaceGroundFactory {
  private _scene: FarmerRaceBaseScene;
  public dirtyTiles = [449, 457, 458, 459, 521, 522];
  public dirtyWeights = [90, 1, 1, 1, 1, 1];
  public grassTiles = [66, 129, 130, 131, 194, 199, 257, 258];
  public grassWeights = [90, 1, 1, 1, 1, 1, 1, 1];
  private streetLines: Phaser.GameObjects.Container[] = [];
  private backgroundLines: Phaser.GameObjects.Container[] = [];
  nextDecoration: number = randomInt(0, MAX_DECORATIONS_LINES);
  private _decorationsFactory: FarmerRaceDecorationFactory;
  nextObstacle: number = randomInt(0, MAX_OBSTACLES_LINES);
  private _obstaclesFactory: FarmerRaceObstacleFactory;

  constructor(scene: FarmerRaceBaseScene) {
    this._scene = scene;
    this._decorationsFactory = new FarmerRaceDecorationFactory(scene);
    this._obstaclesFactory = new FarmerRaceObstacleFactory(scene);
  }
  public preload() {
    const texture = this._scene.textures.get("tileset");
    const textureimage: HTMLImageElement =
      texture.getSourceImage() as HTMLImageElement;
    this._scene.textures.addSpriteSheet("SunnySideSprites", textureimage, {
      frameWidth: 18,
      frameHeight: 18,
    });
  }

  public createBaseRoad() {
    for (let index = 0; index < TOTAL_LINES; index++) {
      this.addRoadLine(START_HEIGHT + SQUARE_WIDTH_TEXTURE * index, false);
      this.addBackgroundLine(
        START_HEIGHT + SQUARE_WIDTH_TEXTURE * index,
        false,
      );
    }
  }
  private addRoadLine(startY: number, start: boolean) {
    const container = this._scene.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    for (let index = 0; index < STREET_COLUMNS; index++) {
      const image = this._scene.add.image(
        x,
        y,
        "SunnySideSprites",
        weightedRandom(this.dirtyTiles, this.dirtyWeights)?.item,
      );
      image.setOrigin(0, 0);
      container.add(image);
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE;
    const imageLeft = this._scene.add.image(x, y, "SunnySideSprites", 454);
    imageLeft.setOrigin(0, 0);
    container.add(imageLeft);
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const imageRight = this._scene.add.image(x, y, "SunnySideSprites", 515);
    imageRight.setOrigin(0, 0);
    container.add(imageRight);
    if (start) this.streetLines.unshift(container);
    else this.streetLines.push(container);
  }
  private addBackgroundLine(startY: number, start: boolean) {
    const container = this._scene.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE;
    for (let index = 0; index < GRASS_COLUMNS; index++) {
      const image = this._scene.add.image(
        x,
        y,
        "SunnySideSprites",
        weightedRandom(this.grassTiles, this.grassWeights)?.item,
      );
      image.setOrigin(0, 0);
      container.add(image);
      x = x - SQUARE_WIDTH_TEXTURE;
    }
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    for (let index = 0; index < GRASS_COLUMNS; index++) {
      const image = this._scene.add.image(
        x,
        y,
        "SunnySideSprites",
        weightedRandom(this.grassTiles, this.grassWeights)?.item,
      );
      image.setOrigin(0, 0);
      container.add(image);
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
      this.nextDecoration = randomInt(0, MAX_DECORATIONS_LINES);
      this._decorationsFactory.addRandomDecoration();
    }
    this._decorationsFactory.update(speed_factor);
  }
}
