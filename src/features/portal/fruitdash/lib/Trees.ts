import {
  SQUARE_WIDTH_TEXTURE,
  START_HEIGHT,
  GRASS_LEFT_MIN,
  GRASS_LEFT_MAX,
  GRASS_RIGHT_MIN,
  FINAL_HEIGHT,
  DECORATION_DEPTH,
  BACKGROUND_SPEED_RATIO,
} from "../util/FruitDashConstants";
import weightedRandom from "../util/Utils";
import { FruitDashBaseScene } from "./FruitDashBaseScene";
import { getHalloweenModeSetting } from "../util/useIsHalloweenMode";
import { getIsTimedEvent } from "../util/useIsTimedEvent";

export class FruitDashTreeFactory {
  private _scene: FruitDashBaseScene;
  //private decorationsMethods = [];
  private decorations: any = {};
  private decorationsLines: Phaser.GameObjects.Container[] = [];
  private IS_HALLOWEEN = false;
  private IS_CHRISTMAS = false;
  private IS_EASTER = false;

  constructor(scene: FruitDashBaseScene) {
    this._scene = scene;
    this.IS_HALLOWEEN = getHalloweenModeSetting();
    this.IS_CHRISTMAS = getIsTimedEvent("CHRISTMAS");
    this.IS_EASTER = getIsTimedEvent("EASTER");
    if (this.IS_HALLOWEEN) {
      this.decorations["tree"] = new HalloweenTreeDecoration(60);
    } else if (this.IS_CHRISTMAS) {
      this.decorations["tree"] = new ChristmasTreeDecoration(60);
    } else if (this.IS_EASTER) {
      this.decorations["tree"] = new EasterTreeDecoration(60);
    } else {
      this.decorations["tree"] = new TreeDecoration(60);
    }
  }

  public addRandomDecoration(): void {
    const keys = Object.keys(this.decorations) as Array<
      keyof typeof this.decorations
    >;
    const weights: number[] = [];
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      weights.push(
        (this.decorations[keys[index]] as FruitDashDecoration).getWeight(),
      );
    }

    const decorationindex = weightedRandom(keys, weights)?.index;
    const decoration = this.decorations[
      keys[decorationindex ? decorationindex : 0]
    ] as FruitDashDecoration;
    const decorationToInsert = decoration.add(this._scene);
    const intersects = false;
    if (intersects) {
      decorationToInsert.destroy();
    } else {
      this.decorationsLines.push(decorationToInsert);
    }
  }

  public update(f: number) {
    if (!this._scene.isGamePlaying) {
      this.decorationsLines = this.decorationsLines.filter(
        (item) => item.active == true,
      );
    }
    for (let index = 0; index < this.decorationsLines.length; index++) {
      this.decorationsLines[index].setDepth(DECORATION_DEPTH);
      this.decorationsLines[index].y +=
        (this._scene.speed / BACKGROUND_SPEED_RATIO) * f;
      if (this.decorationsLines[index].y > FINAL_HEIGHT) {
        this.decorationsLines[index].visible = false;
        this.decorationsLines[index].destroy();
      }
    }
  }
}
abstract class FruitDashDecoration {
  protected _weight = 1;
  constructor(weight: number) {
    this._weight = weight;
  }
  abstract add(scene: Phaser.Scene): Phaser.GameObjects.Container;
  getWeight(): number {
    return this._weight;
  }
}
class ChristmasTreeDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const containerbase = scene.add.container(
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
    );
    const baseX = getBaseXL(2);
    const container = scene.add.container(baseX, 0);
    const image = scene.add.image(0, 0, "christmas_tree");
    image.setOrigin(0, 0);
    container.add(image);
    containerbase.add(container);

    const baseX1 = getBaseXR(2);
    const container1 = scene.add.container(baseX1, 0);
    const image1 = scene.add.image(0, 0, "christmas_tree");
    image1.setOrigin(0, 0);
    container1.add(image1);
    containerbase.add(container1);
    return containerbase;
  }
}
class EasterTreeDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const containerbase = scene.add.container(
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
    );
    const baseX = getBaseXL(2);
    const container = scene.add.container(baseX + 10, 0);
    const image = scene.add.image(0, 0, "easter_tree");
    image.setOrigin(0, 0);
    container.add(image);
    containerbase.add(container);

    const baseX1 = getBaseXR(2);
    const container1 = scene.add.container(baseX1 + 3, 0);
    const image1 = scene.add.image(0, 0, "easter_tree");
    image1.setOrigin(0, 0);
    container1.add(image1);
    containerbase.add(container1);
    return containerbase;
  }
}
class HalloweenTreeDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const containerbase = scene.add.container(
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
    );
    const baseX = getBaseXL(2);
    const container = scene.add.container(baseX, 0);
    let image = scene.add.image(0, 0, "SunnySideSpritesHalloween", 125);
    image.setScale(
      SQUARE_WIDTH_TEXTURE / image.width,
      SQUARE_WIDTH_TEXTURE / image.height,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      0,
      "SunnySideSpritesHalloween",
      126,
    );
    image.setScale(
      SQUARE_WIDTH_TEXTURE / image.width,
      SQUARE_WIDTH_TEXTURE / image.height,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSpritesHalloween",
      178,
    );
    image.setScale(
      SQUARE_WIDTH_TEXTURE / image.width,
      SQUARE_WIDTH_TEXTURE / image.height,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSpritesHalloween",
      179,
    );
    image.setScale(
      SQUARE_WIDTH_TEXTURE / image.width,
      SQUARE_WIDTH_TEXTURE / image.height,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSpritesHalloween",
      231,
    );
    image.setScale(
      SQUARE_WIDTH_TEXTURE / image.width,
      SQUARE_WIDTH_TEXTURE / image.height,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSpritesHalloween",
      232,
    );
    image.setScale(
      SQUARE_WIDTH_TEXTURE / image.width,
      SQUARE_WIDTH_TEXTURE / image.height,
    );
    image.setOrigin(0, 0);
    container.add(image);

    containerbase.add(container);

    const baseX1 = getBaseXR(2);
    const container1 = scene.add.container(baseX1, 0);
    let image1 = scene.add.image(0, 0, "SunnySideSpritesHalloween", 125);
    image1.setScale(
      SQUARE_WIDTH_TEXTURE / image1.width,
      SQUARE_WIDTH_TEXTURE / image1.height,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      0,
      "SunnySideSpritesHalloween",
      126,
    );
    image1.setScale(
      SQUARE_WIDTH_TEXTURE / image1.width,
      SQUARE_WIDTH_TEXTURE / image1.height,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSpritesHalloween",
      178,
    );
    image1.setScale(
      SQUARE_WIDTH_TEXTURE / image1.width,
      SQUARE_WIDTH_TEXTURE / image1.height,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSpritesHalloween",
      179,
    );
    image1.setScale(
      SQUARE_WIDTH_TEXTURE / image1.width,
      SQUARE_WIDTH_TEXTURE / image1.height,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSpritesHalloween",
      231,
    );
    image1.setScale(
      SQUARE_WIDTH_TEXTURE / image1.width,
      SQUARE_WIDTH_TEXTURE / image1.height,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSpritesHalloween",
      232,
    );
    image1.setScale(
      SQUARE_WIDTH_TEXTURE / image1.width,
      SQUARE_WIDTH_TEXTURE / image1.height,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    containerbase.add(container1);
    return containerbase;
  }
}
class TreeDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const containerbase = scene.add.container(
      0,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
    );
    const baseX = getBaseXL(2);
    const container = scene.add.container(baseX, 0);
    let image = scene.add.image(0, 0, "SunnySideSprites", 119);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 120);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 309);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      444,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSprites",
      507,
    );
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSprites",
      508,
    );
    image.setOrigin(0, 0);
    container.add(image);
    containerbase.add(container);

    const baseX1 = getBaseXR(2);
    const container1 = scene.add.container(baseX1, 0);
    let image1 = scene.add.image(0, 0, "SunnySideSprites", 119);
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 120);
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 309);
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      444,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      0,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSprites",
      507,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    image1 = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE * 2,
      "SunnySideSprites",
      508,
    );
    image1.setOrigin(0, 0);
    container1.add(image1);
    containerbase.add(container1);
    return containerbase;
  }
}
function getBaseX(squares: number): number {
  return GRASS_LEFT_MAX - (GRASS_LEFT_MAX - GRASS_LEFT_MIN) / 4;
}

function getBaseXL(squares: number): number {
  return GRASS_LEFT_MAX - 15 - squares * SQUARE_WIDTH_TEXTURE; // - ((GRASS_LEFT_MAX - GRASS_LEFT_MIN) / 4);
}
function getBaseXR(squares: number): number {
  return GRASS_RIGHT_MIN + 15; // + ((GRASS_RIGHT_MAX - GRASS_RIGHT_MIN) / 4);
}
