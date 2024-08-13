import { SceneId } from "features/world/mmoMachine";
import { MachineInterpreter } from "./lib/portalMachine";
import { FactionName, GameState } from "features/game/types/game";
import { Player } from "features/world/types/Room";
import { NPCName } from "lib/npcs";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { translate } from "lib/i18n/translate";
import { isTouchDevice } from "features/world/lib/device";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js";
import {
  AudioController,
  WalkAudioController,
} from "features/world/lib/AudioController";
import {
  AudioLocalStorageKeys,
  getCachedAudioSetting,
} from "../../game/lib/audio";
import { FarmerRaceDecorationFactory } from "./lib/Decorations";
import {
  ZOOM,
  SQUARE_WIDTH_TEXTURE,
  STREET_COLUMNS,
  INITIAL_SPEED,
  TOTAL_LINES,
  START_HEIGHT,
  FINAL_HEIGHT,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  PLAYER_Y,
  GRASS_COLUMNS,
  GROUND_DEPTH,
  PLAYER_DEPTH,
} from "./util/FarmerRaceConstants";
import { randomInt } from "lib/utils/random";

const NAME_TAG_OFFSET_PX = 12;

export class FarmerRaceScene extends Phaser.Scene {
  joystick?: VirtualJoystick;
  sceneId: SceneId = "farmer_race";
  dirtyTiles = [457, 458, 459, 521, 522];
  grassTiles = [66, 129, 130, 131, 194, 199, 257, 258];
  speed = INITIAL_SPEED;
  streetLines: Phaser.GameObjects.Container[] = [];
  currentPlayer: BumpkinContainer | undefined;
  movementAngle: number | undefined;
  isFacingLeft = false;
  walkingSpeed = 50;
  walkAudioController?: WalkAudioController;
  soundEffects: AudioController[] = [];
  nextDecoration: number = randomInt(0, 3);
  decorationsFactory = new FarmerRaceDecorationFactory(this);
  speedInterval: any;
  isPlaying = false;
  cursorKeys:
    | {
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        a?: Phaser.Input.Keyboard.Key;
        d?: Phaser.Input.Keyboard.Key;
      }
    | undefined;

  constructor() {
    super("farmer_race");
  }

  preload() {
    const texture = this.textures.get("tileset");
    const textureimage: HTMLImageElement =
      texture.getSourceImage() as HTMLImageElement;
    this.textures.addSpriteSheet("SunnySideSprites", textureimage, {
      frameWidth: 18,
      frameHeight: 18,
    });
    //super.preload();
  }

  async create() {
    this.physics.world.drawDebug = false;
    this.initialiseCamera();
    this.initialiseSounds();
    this.initialiseControls();
    this.createRoad();
    this.decorationsFactory.addRandomDecoration();
    this.speedInterval = setInterval(() => {
      if (this.isPlaying) {
        //this.speed += 0.1;
      }
    }, 5000);
    this.createPlayer({
      x: PLAYER_MAX_X,
      y: PLAYER_Y,
      // gameService
      farmId: Number(this.id),
      username: this.username,
      isCurrentPlayer: true,
      // gameService
      clothing: {
        ...(this.gameState.bumpkin?.equipped as BumpkinParts),
        updatedAt: 0,
      },
      experience: 0,
      sessionId: "",
    });
    this.startGame();
  }
  async update() {
    this.updatePlayer();
    for (let index = 0; index < this.streetLines.length; index++) {
      this.streetLines[index].setDepth(GROUND_DEPTH);
      this.streetLines[index].y += this.speed;
    }

    const lastLine = this.streetLines[this.streetLines.length - 1];
    if (lastLine.y > FINAL_HEIGHT) {
      this.streetLines.splice(-1);
      lastLine.destroy();
      this.addRoadLine(this.streetLines[0].y - SQUARE_WIDTH_TEXTURE, true);
      this.nextDecoration--;
    }
    if (this.nextDecoration < 0) {
      this.nextDecoration = randomInt(0, 3);
      this.decorationsFactory.addRandomDecoration();
    }
    this.decorationsFactory.update(this.speed);
    this.currentPlayer?.setDepth(PLAYER_DEPTH);
  }
  public startGame() {
    this.isPlaying = true;
  }
  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }

  public initialiseCamera() {
    const camera = this.cameras.main;
    camera.setZoom(ZOOM);
    camera.fadeIn();
  }
  public initialiseSounds() {
    const audioMuted = getCachedAudioSetting<boolean>(
      AudioLocalStorageKeys.audioMuted,
      false
    );
    if (!audioMuted) {
      this.walkAudioController = new WalkAudioController(
        this.sound.add("dirt_footstep")
      );
    }
  }
  createRoad() {
    for (let index = 0; index < TOTAL_LINES; index++) {
      this.addRoadLine(START_HEIGHT + SQUARE_WIDTH_TEXTURE * index, false);
    }
  }
  addRoadLine(startY: number, start: boolean) {
    const container = this.add.container();
    container.y = startY;
    let x = window.innerWidth / 2 - SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const y = 0;
    for (let index = 0; index < STREET_COLUMNS; index++) {
      const image = this.add.image(
        x,
        y,
        "SunnySideSprites",
        this.dirtyTiles[randomInt(0, this.dirtyTiles.length - 1)]
      );
      image.setOrigin(0, 0);
      container.add(image);
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE;
    for (let index = 0; index < GRASS_COLUMNS; index++) {
      const image = this.add.image(
        x,
        y,
        "SunnySideSprites",
        this.grassTiles[randomInt(0, this.grassTiles.length - 1)]
      );
      image.setOrigin(0, 0);
      container.add(image);
      x = x - SQUARE_WIDTH_TEXTURE;
    }
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    for (let index = 0; index < GRASS_COLUMNS; index++) {
      const image = this.add.image(
        x,
        y,
        "SunnySideSprites",
        this.grassTiles[randomInt(0, this.grassTiles.length - 1)]
      );
      image.setOrigin(0, 0);
      container.add(image);
      x = x + SQUARE_WIDTH_TEXTURE;
    }
    x =
      window.innerWidth / 2 -
      SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2) -
      SQUARE_WIDTH_TEXTURE;
    const imageLeft = this.add.image(x, y, "SunnySideSprites", 454);
    imageLeft.setOrigin(0, 0);
    container.add(imageLeft);
    x = window.innerWidth / 2 + SQUARE_WIDTH_TEXTURE * (STREET_COLUMNS / 2);
    const imageRight = this.add.image(x, y, "SunnySideSprites", 515);
    imageRight.setOrigin(0, 0);
    container.add(imageRight);
    if (start) this.streetLines.unshift(container);
    else this.streetLines.push(container);
  }

  createPlayer({
    x,
    y,
    farmId,
    username,
    faction,
    isCurrentPlayer,
    clothing,
    npc,
    experience = 0,
    sessionId,
  }: {
    isCurrentPlayer: boolean;
    x: number;
    y: number;
    farmId: number;
    username?: string;
    faction?: FactionName;
    clothing: Player["clothing"];
    npc?: NPCName;
    experience?: number;
    sessionId: string;
  }): BumpkinContainer {
    const defaultClick = () => {
      const distance = Phaser.Math.Distance.BetweenPoints(
        entity,
        this.currentPlayer as BumpkinContainer
      );

      if (distance > 50) {
        entity.speak(translate("base.far.away"));
        return;
      }
    };

    const entity = new BumpkinContainer({
      scene: this,
      x,
      y,
      clothing,
      name: npc,
      onClick: defaultClick,
    });

    if (!npc) {
      const nameTagYPosition = 0;

      const nameTag = this.createPlayerText({
        x: 0,
        y: nameTagYPosition,
        text: username ? username : `#${farmId}`,
      });
      nameTag.setShadow(1, 1, "#161424", 0, false, true);
      nameTag.name = "nameTag";
      entity.add(nameTag);
    }

    // Is current player
    if (isCurrentPlayer) {
      this.currentPlayer = entity;
      // (this.currentPlayer.body as Phaser.Physics.Arcade.Body).width = 10;
      (this.currentPlayer.body as Phaser.Physics.Arcade.Body)
        .setOffset(3, 3)
        .setSize(10, 12)
        .setCollideWorldBounds(true);

      (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setAllowRotation(
        false
      );

      // Follow player with camera
      //this.cameras.main.startFollow(this.currentPlayer);

      // Callback to fire on collisions
      // this.physics.add.collider(
      //   this.currentPlayer,
      //   this.colliders as Phaser.GameObjects.Group,
      //   // Read custom Tiled Properties
      //   async (obj1, obj2) => {
      //     const id = (obj2 as any).data?.list?.id;

      //     // See if scene has registered any callbacks to perform
      //     const cb = this.onCollision[id];
      //     if (cb) {
      //       cb(obj1, obj2);
      //     }

      //     // Change scenes
      //     const warpTo = (obj2 as any).data?.list?.warp;
      //     if (warpTo && this.currentPlayer?.isWalking) {
      //       this.changeScene(warpTo);
      //     }

      //     const interactable = (obj2 as any).data?.list?.open;
      //     if (interactable) {
      //       interactableModalManager.open(interactable);
      //     }
      //   },
      // );

      // this.physics.add.overlap(
      //   this.currentPlayer,
      //   this.triggerColliders as Phaser.GameObjects.Group,
      //   (obj1, obj2) => {
      //     // You can access custom properties of the trigger object here
      //     const id = (obj2 as any).data?.list?.id;

      //     // See if scene has registered any callbacks to perform
      //     const cb = this.onCollision[id];
      //     if (cb) {
      //       cb(obj1, obj2);
      //     }
      //   },
      // );
    } else {
      (entity.body as Phaser.Physics.Arcade.Body)
        .setSize(16, 20)
        .setOffset(0, 0);
    }

    return entity;
  }

  createPlayerText({
    x,
    y,
    text,
    color,
  }: {
    x: number;
    y: number;
    text: string;
    color?: string;
  }) {
    const textObject = this.add.text(x, y + NAME_TAG_OFFSET_PX, text, {
      fontSize: "4px",
      fontFamily: "monospace",
      resolution: 4,
      padding: { x: 2, y: 2 },
      color: color ?? "#ffffff",
    });

    textObject.setOrigin(0.5);

    this.physics.add.existing(textObject);
    (textObject.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;

    return textObject;
  }

  updatePlayer() {
    if (!this.currentPlayer?.body) {
      return;
    }
    // joystick is active if force is greater than zero
    this.movementAngle = this.joystick?.force
      ? this.joystick?.angle
      : undefined;

    // use keyboard control if joystick is not active
    if (this.movementAngle === undefined) {
      if (document.activeElement?.tagName === "INPUT") return;

      const left =
        (this.cursorKeys?.left.isDown || this.cursorKeys?.a?.isDown) ?? false;
      const right =
        (this.cursorKeys?.right.isDown || this.cursorKeys?.d?.isDown) ?? false;

      this.movementAngle = this.keysToAngle(left, right, false, false);
    }
    // change player direction if angle is changed from left to right or vise versa
    if (
      this.movementAngle !== undefined &&
      Math.abs(this.movementAngle) !== 90
    ) {
      this.isFacingLeft = Math.abs(this.movementAngle) > 90;
      this.isFacingLeft
        ? this.currentPlayer.faceLeft()
        : this.currentPlayer.faceRight();
    }

    // set player velocity
    const currentPlayerBody = this.currentPlayer
      .body as Phaser.Physics.Arcade.Body;
    if (this.movementAngle !== undefined) {
      currentPlayerBody.setVelocity(
        this.walkingSpeed * Math.cos((this.movementAngle * Math.PI) / 180),
        this.walkingSpeed * Math.sin((this.movementAngle * Math.PI) / 180)
      );
    } else {
      currentPlayerBody.setVelocity(0, 0);
    }

    const isMoving =
      this.movementAngle !== undefined && this.walkingSpeed !== 0;

    if (this.soundEffects) {
      this.soundEffects.forEach((audio) =>
        audio.setVolumeAndPan(
          this.currentPlayer?.x ?? 0,
          this.currentPlayer?.y ?? 0
        )
      );
    } else {
      // eslint-disable-next-line no-console
      console.error("audioController is undefined");
    }

    if (this.walkAudioController) {
      this.walkAudioController.handleWalkSound(isMoving);
    } else {
      // eslint-disable-next-line no-console
      console.error("walkAudioController is undefined");
    }

    //if (isMoving) {
    this.currentPlayer.walk();
    // } else {
    //   this.currentPlayer.idle();
    //}

    this.currentPlayer.setDepth(Math.floor(this.currentPlayer.y));
    if (this.currentPlayer) {
      if (this.currentPlayer.x < PLAYER_MIN_X) {
        this.currentPlayer.x = PLAYER_MIN_X;
      }
      if (this.currentPlayer.x > PLAYER_MAX_X) {
        this.currentPlayer.x = PLAYER_MAX_X;
      }
      this.currentPlayer.y = PLAYER_Y;
    }
    // this.cameras.main.setScroll(this.currentPlayer.x, this.currentPlayer.y);
  }

  keysToAngle(
    left: boolean,
    right: boolean,
    up: boolean,
    down: boolean
  ): number | undefined {
    // calculate the x and y components based on key states
    const x = (right ? 1 : 0) - (left ? 1 : 0);
    const y = (down ? 1 : 0) - (up ? 1 : 0);

    if (x === 0 && y === 0) {
      return undefined;
    }

    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  public get gameState() {
    return this.registry.get("gameState") as GameState;
  }

  public get id() {
    return this.registry.get("id") as number;
  }

  public get username() {
    return this.gameState.username;
  }

  public initialiseControls() {
    if (isTouchDevice()) {
      // Initialise joystick
      const { x, y, centerX, centerY, width, height } = this.cameras.main;
      this.joystick = new VirtualJoystick(this, {
        x: centerX,
        y: centerY - 35 + height / ZOOM / 2,
        radius: 15,
        base: this.add.circle(0, 0, 15, 0x000000, 0.2).setDepth(1000000000),
        thumb: this.add.circle(0, 0, 7, 0xffffff, 0.2).setDepth(1000000000),
        forceMin: 2,
      });
    }
    // Initialise Keyboard
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
    if (this.cursorKeys) {
      const mmoLocalSettings = JSON.parse(
        localStorage.getItem("mmo_settings") ?? "{}"
      );
      const layout = mmoLocalSettings.layout ?? "QWERTY";

      // add WASD keys
      this.cursorKeys.a = this.input.keyboard?.addKey(
        layout === "QWERTY" ? "A" : "Q",
        false
      );
      this.cursorKeys.d = this.input.keyboard?.addKey("D", false);

      this.input.keyboard?.removeCapture("SPACE");
    }

    this.input.setTopOnly(true);
  }
}
