import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME } from "./util/IrrigateConstants";
import { Netwalk } from "./lib/NetWalk";
import mapJson from "./assets/irrigate.json";
import defaultTilesetConfig from "assets/map/tileset.json";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { MachineInterpreter } from "./lib/IrrigateMachine";
import RexGesturePlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

export class IrrigateScene extends Phaser.Scene {
  sceneId: SceneId = MINIGAME_NAME;
  gameBoard: Netwalk;
  public map: Phaser.Tilemaps.Tilemap = {} as Phaser.Tilemaps.Tilemap;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
  zoomLevel = 0;
  ZOOM = 0;
  rexGestures: RexGesturePlugin | undefined;
  dragState: any = { active: false, prevPointer: null, start: 0 };

  constructor() {
    super(MINIGAME_NAME);
    this.gameBoard = new Netwalk(this);
  }

  preload() {
    this.loadSprites();
    const json = {
      ...mapJson,
      tilesets: defaultTilesetConfig.tilesets,
    };
    this.load.tilemapTiledJSON("irrigatemap", json);
    const url =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js";
    this.load.plugin("rexpinchplugin", url, true);
  }

  async create() {
    this.initialiseCamera();
    this.initialiseMap();
    this.updateCameraBounds();
  }
  handlePan(pointer: Phaser.Input.Pointer) {
    if (this.dragState.active) {
      const deltaX = this.dragState.prevPointer.x - pointer.x;
      const deltaY = this.dragState.prevPointer.y - pointer.y;

      this.cameras.main.scrollX += deltaX / this.ZOOM;
      this.cameras.main.scrollY += deltaY / this.ZOOM;

      this.dragState.prevPointer = { x: pointer.x, y: pointer.y };
    }
  }
  updateCameraBounds() {
    const canvasWidth = window.innerWidth / this.ZOOM;
    const canvasHeight = window.innerHeight / this.ZOOM;

    this.cameras.main.setBounds(
      0,
      0,
      Math.max(this.map.widthInPixels, canvasWidth),
      Math.max(this.map.heightInPixels, canvasHeight),
    );
  }
  async update(time: number, delta: number) {
    // console.log(this.portalService?.state.value);
    // console.log(this.portalService?.state.context.movesLeft);
    if (this.isGameReady) this.gameBoard.newGame(1);

    if (!this.isGamePlaying) this.gameBoard.cleanBoard();
    // end game when time is up
    if (this.isGamePlaying && this.secondsLeft <= 0) {
      this.endGame(0);
    }
  }
  public endGame = (score: number) => {
    this.portalService?.send("GAME_OVER", {
      score: score,
    });

    // // play sound
    // const sound = this.sound.add("game_over");
    // sound.play({ volume: 0.5 });
  };

  public get secondsLeft() {
    const endAt = this.portalService?.state.context.endAt;
    const secondsLeft = !endAt ? 0 : Math.max(endAt - Date.now(), 0) / 1000;
    return secondsLeft;
  }

  public get movesMade() {
    return this.portalService ? this.portalService?.state.context.movesMade : 0;
  }
  public get maxMoves() {
    return this.portalService ? this.portalService?.state.context.maxMoves : 0;
  }
  private initialiseCamera() {
    const camera = this.cameras.main;
    const baseZoom =
      window.innerWidth < window.innerHeight
        ? window.innerWidth
        : window.innerHeight;
    this.ZOOM = baseZoom / (20 * SQUARE_WIDTH);
    camera.setZoom(this.ZOOM);
    camera.fadeIn();

    this.input.on(
      "wheel",
      (
        pointer: any,
        gameObjects: any,
        deltaX: any,
        deltaY: any,
        deltaZ: any,
      ) => {
        this.handleZoom(pointer, deltaX, deltaY);
      },
    );

    const pinch = this.rexGestures?.add.pinch(this);
    if (pinch) {
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (this.dragState.start > 0) {
          const duration = Date.now() - this.dragState.start;
          if (duration > 100) {
            this.dragState.active = true;
          }
        }
      });
      pinch
        .on("drag1start", () => {
          this.dragState.start = Date.now();
        })
        .on("drag1end", () => {
          this.dragState.start = 0;
          this.dragState.active = false;
        })
        .on("pinchstart", () => {
          this.dragState.active = true;
          this.dragState.start = Date.now();
        })
        .on("pinchend", () => {
          setTimeout(() => {
            this.dragState.active = false;
          }, 100);
        })
        .on("drag1", function (pinch: { drag1Vector: any }) {
          const drag1Vector = pinch.drag1Vector;
          camera.scrollX -= drag1Vector.x / camera.zoom;
          camera.scrollY -= drag1Vector.y / camera.zoom;
        })
        .on(
          "pinch",
          function (pinch: { scaleFactor: any }) {
            const scaleFactor = pinch.scaleFactor;
            const newZoom = Phaser.Math.Clamp(
              camera.zoom * scaleFactor,
              baseZoom / (20 * SQUARE_WIDTH),
              baseZoom / (20 * SQUARE_WIDTH) + 1.5,
            );
            camera.setZoom(newZoom);
          },
          this,
        );
    }
    /*
    window.addEventListener("zoomIn", (event) => {
      const camera = this.cameras.main;
      if (event.type === "zoomIn") {
        //console.log(this.zoomLevel);
        if (this.zoomLevel < 3) {
          this.zoomLevel = this.zoomLevel + 1;
          this.ZOOM = this.ZOOM + 0.5;
        }
      }
      camera.setZoom(this.ZOOM);
    });
    window.addEventListener("zoomOut", (event) => {
      const camera = this.cameras.main;
      if (event.type === "zoomOut") {
        if (this.zoomLevel > 0) {
          this.zoomLevel = this.zoomLevel - 1;
          this.ZOOM = this.ZOOM - 0.5;
        }
      }
      camera.setZoom(this.ZOOM);
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.dragState.start = Date.now();
      this.dragState.prevPointer = { x: pointer.x, y: pointer.y };
    });


    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.dragState.start = 0;
      this.dragState.active = false;
    });*/
  }
  handleZoom(pointer: Phaser.Input.Pointer, deltaX: number, deltaY: number) {
    const zoomDirection = deltaY > 0 ? -1 : 1;
    if (
      (zoomDirection == 1 && this.zoomLevel < 3) ||
      (zoomDirection == -1 && this.zoomLevel > 0)
    ) {
      const baseZoom =
        window.innerWidth < window.innerHeight
          ? window.innerWidth
          : window.innerHeight;
      this.ZOOM = this.cameras.main.zoom + zoomDirection * 0.5;
      const newZoom = Phaser.Math.Clamp(
        this.ZOOM,
        baseZoom / (20 * SQUARE_WIDTH),
        baseZoom / (20 * SQUARE_WIDTH) + 1.5,
      );
      this.zoomLevel = this.zoomLevel + zoomDirection;
      this.cameras.main.setZoom(newZoom);
    }
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
    this.load.image("source", "world/irrigate/source.png");
    this.load.image("cropplot", "world/irrigate/cropplot.png");
    this.load.image("crop1", "world/irrigate/crop1.png");
    this.load.image("crop2", "world/irrigate/crop2.png");
    this.load.image("crop3", "world/irrigate/crop3.png");
    this.load.image("crop4", "world/irrigate/crop4.png");
  }

  public initialiseMap() {
    this.map = this.make.tilemap({
      key: "irrigatemap",
    });

    const tileset = this.map.addTilesetImage(
      "Sunnyside V3",
      "tileset",
      16,
      16,
      1,
      2,
    ) as Phaser.Tilemaps.Tileset;
    this.map.layers.forEach((layerData, idx) => {
      const layer = this.map.createLayer(layerData.name, [tileset], 0, 0);
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });
    this.cameras.main.centerOn(
      (this.map.width / 2) * SQUARE_WIDTH,
      (this.map.height / 2) * SQUARE_WIDTH,
    );
  }

  public get isGamePlaying() {
    return this.portalService?.state.matches("playing") === true;
  }
  public get isGameReady() {
    return this.portalService?.state.matches("ready") === true;
  }
  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }
  private get target() {
    return (
      this.portalService?.state?.context.state?.minigames.prizes[MINIGAME_NAME]
        ?.score ?? 1080
    );
  }
}
