import mapJsonBase from "../../../assets/map/defense-base.json";
import mapJson from "../../../assets/map/defense-1.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "features/world/scenes/BaseScene";
import { MachineInterpreter } from "../../portalMachine";
import defaultTilesetConfig from "assets/map/tileset.json";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { GoblinInvasionEnemy } from "../../Enemies";
export class GoblinInvasionLevel1 extends BaseScene {
  sceneId: SceneId = "farmer_football";
  graphics: any;
  path: any;
  enemies: any[] = [];
  enemies1: GoblinInvasionEnemy[] = [];
  startTime = 15000;
  constructor() {
    super({
      name: "farmer_football",
      map: {
        json: mapJsonBase,
      },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  preload() {
    const json = {
      ...mapJson,
      tilesets: defaultTilesetConfig.tilesets,
    };
    this.load.tilemapTiledJSON("goblin_invasion_level", json);
    super.preload();
  }

  async create() {
    this.map = this.make.tilemap({
      key: "goblin_invasion",
    });
    super.create();
    const tileset = this.map.addTilesetImage(
      "Sunnyside V3",
      "tileset",
      16,
      16,
      1,
      2,
    ) as Phaser.Tilemaps.Tileset;
    const map1 = this.make.tilemap({ key: "goblin_invasion_level" });
    map1.layers.forEach((layerData, idx) => {
      const layer = map1.createLayer(
        layerData.name,
        [tileset],
        SQUARE_WIDTH * 3,
        SQUARE_WIDTH * 3,
      );
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });
    this.createPath();

    for (let i = 0; i < 3; i++) {
      this.enemies.push({ level: 1, time: i * 1000 });
    }
    //console.log(this);
  }
  update(t: number, dt: number) {
    this.updatePlayer();
    if (this.enemies.length > 0) {
      const nextEnemy = this.enemies[0];
      if (nextEnemy.time + this.startTime <= t) {
        this.enemies1.push(
          new GoblinInvasionEnemy(this, nextEnemy.level, this.path),
        );
        this.enemies.shift();
      }
    }
    this.enemies1.forEach((enemy) => {
      enemy.update(t, dt);
    });
  }
  createPath() {
    // this graphics element is only for visualization,
    // its not related to our path
    const graphics = this.add.graphics();

    // the path for our enemies
    // parameters are the start x and y of our path
    this.path = this.add.path(SQUARE_WIDTH * 6, SQUARE_WIDTH * 3);
    this.path.lineTo(SQUARE_WIDTH * 6, SQUARE_WIDTH * 7);
    this.path.lineTo(SQUARE_WIDTH * 7, SQUARE_WIDTH * 8);
    this.path.lineTo(SQUARE_WIDTH * 18, SQUARE_WIDTH * 8);
    this.path.lineTo(SQUARE_WIDTH * 19, SQUARE_WIDTH * 9);
    this.path.lineTo(SQUARE_WIDTH * 19, SQUARE_WIDTH * 12);
    this.path.lineTo(SQUARE_WIDTH * 18, SQUARE_WIDTH * 13);
    this.path.lineTo(SQUARE_WIDTH * 7, SQUARE_WIDTH * 13);
    this.path.lineTo(SQUARE_WIDTH * 6, SQUARE_WIDTH * 14);
    this.path.lineTo(SQUARE_WIDTH * 6, SQUARE_WIDTH * 18);
    this.path.lineTo(SQUARE_WIDTH * 7, SQUARE_WIDTH * 19);
    this.path.lineTo(SQUARE_WIDTH * 13.5, SQUARE_WIDTH * 19);
    this.path.lineTo(SQUARE_WIDTH * 15.5, SQUARE_WIDTH * 17);
    this.path.lineTo(SQUARE_WIDTH * 18, SQUARE_WIDTH * 17);
    this.path.lineTo(SQUARE_WIDTH * 19, SQUARE_WIDTH * 18);
    this.path.lineTo(SQUARE_WIDTH * 19, SQUARE_WIDTH * 23);
    graphics.lineStyle(1, 0xffffff, 1);
    // visualize the path
    //this.path.draw(graphics);
  }
  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }
}
