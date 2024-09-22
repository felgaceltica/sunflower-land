import { randomBoolean, randomInt } from "lib/utils/random";
import {
  SQUARE_WIDTH_TEXTURE,
  START_HEIGHT,
  GRASS_LEFT_MIN,
  GRASS_LEFT_MAX,
  GRASS_RIGHT_MIN,
  GRASS_RIGHT_MAX,
  FINAL_HEIGHT,
  DECORATION_DEPTH,
  BACKGROUND_SPEED_RATIO,
  IS_HALLOWEEN,
} from "../util/FruitDashConstants";
import weightedRandom from "../util/Utils";
import { FruitDashBaseScene } from "./FruitDashBaseScene";

export class FruitDashDecorationFactory {
  private _scene: FruitDashBaseScene;
  //private decorationsMethods = [];
  private decorations: any = {};
  private decorationsLines: Phaser.GameObjects.Container[] = [];

  constructor(scene: FruitDashBaseScene) {
    this._scene = scene;
    if (IS_HALLOWEEN) {
      this.decorations["tree"] = new HalloweenTreeDecoration(60);
    } else {
      this.decorations["tree"] = new TreeDecoration(60);
    }
    //this.decorations["flower"] = new FlowerDecoration(20);
    // this.decorations["bush"] = new BushDecoration(15);
    // this.decorations["mushroom"] = new MushroomDecoration(15);
    // this.decorations["choppedtree"] = new ChoppedTreeDecoration(10);
    // this.decorations["goldrock"] = new GoldRockDecoration(5);
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
    // for (let index = 0; index < this.decorationsLines.length; index++) {
    //   if (
    //     Phaser.Geom.Intersects.RectangleToRectangle(
    //       this.decorationsLines[index].getBounds(),
    //       decorationToInsert.getBounds(),
    //     )
    //   ) {
    //     intersects = true;
    //   }
    // }
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
class MushroomDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const baseX = getBaseX(1);
    const container = scene.add.container(baseX, START_HEIGHT);
    const image = scene.add.image(0, 0, "SunnySideSprites", 561);
    image.setOrigin(0, 0);
    container.add(image);
    return container;
  }
}

class GoldRockDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const baseX = getBaseX(2);
    const container = scene.add.container(
      baseX,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 1,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 1779);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 1780);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 1843);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      1844,
    );
    image.setOrigin(0, 0);
    container.add(image);
    return container;
  }
}

class BushDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const baseX = getBaseX(2);
    const container = scene.add.container(
      baseX,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 1,
    );
    let image = scene.add.image(0, 0, "SunnySideSprites", 241);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(SQUARE_WIDTH_TEXTURE, 0, "SunnySideSprites", 242);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(0, SQUARE_WIDTH_TEXTURE, "SunnySideSprites", 305);
    image.setOrigin(0, 0);
    container.add(image);
    image = scene.add.image(
      SQUARE_WIDTH_TEXTURE,
      SQUARE_WIDTH_TEXTURE,
      "SunnySideSprites",
      306,
    );
    image.setOrigin(0, 0);
    container.add(image);
    return container;
  }
}

class FlowerDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const flowers = [223, 225, 159, 161, 95, 97, 92, 156, 220, 284];
    const baseX = getBaseX(1);
    const container = scene.add.container(baseX, START_HEIGHT);
    const image = scene.add.image(
      0,
      0,
      "SunnySideSprites",
      flowers[randomInt(0, flowers.length)],
    );
    image.setOrigin(0, 0);
    container.add(image);
    return container;
  }
}
class ChoppedTreeDecoration extends FruitDashDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const baseX = getBaseX(1);
    const container = scene.add.container(baseX, START_HEIGHT);
    const image = scene.add.image(0, 0, "SunnySideSprites", 351);
    image.setOrigin(0, 0);
    container.add(image);
    return container;
  }
}
function getBaseX(squares: number): number {
  return GRASS_LEFT_MAX - (GRASS_LEFT_MAX - GRASS_LEFT_MIN) / 4;
  //Left or right
  if (randomBoolean()) {
    return randomInt(
      GRASS_LEFT_MIN,
      GRASS_LEFT_MAX - squares * SQUARE_WIDTH_TEXTURE,
    );
  } else {
    return randomInt(
      GRASS_RIGHT_MIN,
      GRASS_RIGHT_MAX - squares * SQUARE_WIDTH_TEXTURE,
    );
  }
}

function getBaseXL(squares: number): number {
  return GRASS_LEFT_MAX - 15 - squares * SQUARE_WIDTH_TEXTURE; // - ((GRASS_LEFT_MAX - GRASS_LEFT_MIN) / 4);
}
function getBaseXR(squares: number): number {
  return GRASS_RIGHT_MIN + 15; // + ((GRASS_RIGHT_MAX - GRASS_RIGHT_MIN) / 4);
}
