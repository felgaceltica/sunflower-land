import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME, ZOOM } from "./util/IrrigateConstants";
import { Netwalk } from "./lib/NetWalk";

export class IrrigateScene extends Phaser.Scene {
  sceneId: SceneId = MINIGAME_NAME;
  gameBoard: Netwalk;

  constructor() {
    super(MINIGAME_NAME);
    this.gameBoard = new Netwalk({ rows: 7, columns: 7 }, this);
  }

  preload() {
    this.loadSprites();
  }
  async create() {
    //super.create();
    this.initialiseCamera();
    this.gameBoard.newGame();
  }

  // async update(time: number, delta: number) {

  // }
  private initialiseCamera() {
    const camera = this.cameras.main;
    camera.setZoom(ZOOM);
    camera.fadeIn();
  }
  private loadSprites() {
    this.load.image("1", "world/irrigate/1.png");
    this.load.image("1_C", "world/irrigate/1_C.png");

    this.load.image("2", "world/irrigate/2.png");
    this.load.image("2_C", "world/irrigate/2_C.png");

    this.load.image("3", "world/irrigate/3.png");
    this.load.image("3_C", "world/irrigate/3_C.png");

    this.load.image("4", "world/irrigate/4.png");
    this.load.image("4_C", "world/irrigate/4_C.png");

    this.load.image("5", "world/irrigate/5.png");
    this.load.image("5_C", "world/irrigate/5_C.png");

    this.load.image("6", "world/irrigate/6.png");
    this.load.image("6_C", "world/irrigate/6_C.png");

    this.load.image("7", "world/irrigate/7.png");
    this.load.image("7_C", "world/irrigate/7_C.png");

    this.load.image("8", "world/irrigate/8.png");
    this.load.image("8_C", "world/irrigate/8_C.png");

    this.load.image("9", "world/irrigate/9.png");
    this.load.image("9_C", "world/irrigate/9_C.png");

    this.load.image("10", "world/irrigate/10.png");
    this.load.image("10_C", "world/irrigate/10_C.png");

    this.load.image("11", "world/irrigate/11.png");
    this.load.image("11_C", "world/irrigate/11_C.png");

    this.load.image("12", "world/irrigate/12.png");
    this.load.image("12_C", "world/irrigate/12_C.png");

    this.load.image("13", "world/irrigate/13.png");
    this.load.image("13_C", "world/irrigate/13_C.png");

    this.load.image("14", "world/irrigate/14.png");
    this.load.image("14_C", "world/irrigate/14_C.png");

    this.load.image("17", "world/irrigate/17.png");
    this.load.image("18", "world/irrigate/18.png");
    this.load.image("20", "world/irrigate/20.png");
    this.load.image("24", "world/irrigate/24.png");
  }
}
