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
} from "../util/FarmerRaceConstants";
import weightedRandom from "../util/Utils";
import { FarmerRaceBaseScene } from "./FarmerRaceBaseScene";

export class FarmerRaceDecorationFactory {
  private _scene: FarmerRaceBaseScene;
  //private decorationsMethods = [];
  private decorations: any = {};
  private decorationsLines: Phaser.GameObjects.Container[] = [];

  constructor(scene: FarmerRaceBaseScene) {
    this._scene = scene;
    // this.decorations["tree"] = new TreeDecoration(60);
    this.decorations["flower"] = new FlowerDecoration(20);
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
        (this.decorations[keys[index]] as FarmerRaceDecoration).getWeight(),
      );
    }

    const decorationindex = weightedRandom(keys, weights)?.index;
    const decoration = this.decorations[
      keys[decorationindex ? decorationindex : 0]
    ] as FarmerRaceDecoration;
    const decorationToInsert = decoration.add(this._scene);
    let intersects = false;
    for (let index = 0; index < this.decorationsLines.length; index++) {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.decorationsLines[index].getBounds(),
          decorationToInsert.getBounds(),
        )
      ) {
        intersects = true;
      }
    }
    if (intersects) {
      decorationToInsert.destroy();
    } else {
      this.decorationsLines.push(decorationToInsert);
    }
  }

  public update() {
    for (let index = 0; index < this.decorationsLines.length; index++) {
      this.decorationsLines[index].setDepth(DECORATION_DEPTH);
      this.decorationsLines[index].y +=
        this._scene.speed / BACKGROUND_SPEED_RATIO;
      if (this.decorationsLines[index].y > FINAL_HEIGHT) {
        this.decorationsLines[index].visible = false;
        this.decorationsLines[index].destroy();
      }
    }
    this.decorationsLines = this.decorationsLines.filter(
      (item) => item.active == true,
    );
  }
}
abstract class FarmerRaceDecoration {
  protected _weight = 1;
  constructor(weight: number) {
    this._weight = weight;
  }
  abstract add(scene: Phaser.Scene): Phaser.GameObjects.Container;
  getWeight(): number {
    return this._weight;
  }
}
class TreeDecoration extends FarmerRaceDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const baseX = getBaseX(2);
    const container = scene.add.container(
      baseX,
      START_HEIGHT - SQUARE_WIDTH_TEXTURE * 2,
    );
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
    return container;
  }
}
class MushroomDecoration extends FarmerRaceDecoration {
  add(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const baseX = getBaseX(1);
    const container = scene.add.container(baseX, START_HEIGHT);
    const image = scene.add.image(0, 0, "SunnySideSprites", 561);
    image.setOrigin(0, 0);
    container.add(image);
    return container;
  }
}

class GoldRockDecoration extends FarmerRaceDecoration {
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

class BushDecoration extends FarmerRaceDecoration {
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

class FlowerDecoration extends FarmerRaceDecoration {
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
class ChoppedTreeDecoration extends FarmerRaceDecoration {
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
