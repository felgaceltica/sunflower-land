import { SceneId } from "features/world/mmoMachine";
import { MachineInterpreter } from "./FarmerRaceMachine";
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
  ZOOM,
  INITIAL_SPEED,
  PLAYER_MIN_X,
  PLAYER_MAX_X,
  PLAYER_Y,
  PLAYER_DEPTH,
  NAME_TAG_OFFSET_PX,
  SPEED_INCREMENT,
  WALK_SPEED_INCREMENT,
  INITIAL_WALK_SPEED,
  MAX_SPEED,
  MAX_WALK_SPEED,
} from "../util/FarmerRaceConstants";
import { getAudioMutedSetting } from "lib/utils/hooks/useIsAudioMuted";
import { MINIGAME_NAME } from "../util/FarmerRaceConstants";
import { FarmerRaceGroundFactory } from "./Ground";
import { getAnimationUrl } from "features/world/lib/animations";
import { ITEM_DETAILS } from "features/game/types/images";

export abstract class FarmerRaceBaseScene extends Phaser.Scene {
  joystick?: VirtualJoystick;
  sceneId: SceneId = "farmer_race";
  speed = INITIAL_SPEED;
  currentPlayer: BumpkinContainer | undefined;
  movementAngle: number | undefined;
  isFacingLeft = false;
  walkingSpeed = INITIAL_WALK_SPEED;
  walkAudioController?: WalkAudioController;
  soundEffects: AudioController[] = [];
  groundFactory = new FarmerRaceGroundFactory(this);
  speedInterval: any;
  cursorKeys:
    | {
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        a?: Phaser.Input.Keyboard.Key;
        d?: Phaser.Input.Keyboard.Key;
      }
    | undefined;
  constructor() {
    super(MINIGAME_NAME);
  }
  preload() {
    this.groundFactory.preload();
    this.load.image("apple", ITEM_DETAILS["Apple"].image);
    this.load.image("banana", ITEM_DETAILS["Banana"].image);
    this.load.image("orange", ITEM_DETAILS["Orange"].image);
    this.load.image("blueberry", ITEM_DETAILS["Blueberry"].image);
    const url = getAnimationUrl(
      this.gameState.bumpkin?.equipped as BumpkinParts,
      "death",
    );
    this.load.spritesheet("player_death", url, {
      frameWidth: 96,
      frameHeight: 64,
    });
  }
  async create() {
    this.physics.world.drawDebug = true;
    this.initialiseCamera();
    this.initialiseSounds();
    this.initialiseControls();
    this.groundFactory.createBaseRoad();
    this.speedInterval = setInterval(() => {
      if (this.isGamePlaying) {
        this.speed = this.speed + SPEED_INCREMENT;
        this.walkingSpeed = this.walkingSpeed + WALK_SPEED_INCREMENT;
        if (this.speed > MAX_SPEED) {
          this.speed = MAX_SPEED;
        }
        if (this.walkingSpeed > MAX_WALK_SPEED) {
          this.walkingSpeed = MAX_WALK_SPEED;
        }
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
    this.anims.create({
      key: "player_death_anim",
      frames: this.anims.generateFrameNumbers("player_death"),
      frameRate: 10,
      repeat: 0,
    });
  }
  async update() {
    this.updatePlayer();
    this.groundFactory.update();
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

  private initialiseCamera() {
    const camera = this.cameras.main;
    camera.setZoom(ZOOM);
    camera.fadeIn();
  }
  private initialiseSounds() {
    const audioMuted = getAudioMutedSetting();
    if (!audioMuted) {
      this.walkAudioController = new WalkAudioController(
        this.sound.add("dirt_footstep"),
      );
    }
  }
  public updatePlayer() {
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
        this.walkingSpeed * Math.sin((this.movementAngle * Math.PI) / 180),
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
          this.currentPlayer?.y ?? 0,
        ),
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

    this.currentPlayer?.setDepth(PLAYER_DEPTH);
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
    down: boolean,
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
        localStorage.getItem("mmo_settings") ?? "{}",
      );
      const layout = mmoLocalSettings.layout ?? "QWERTY";

      // add WASD keys
      this.cursorKeys.a = this.input.keyboard?.addKey(
        layout === "QWERTY" ? "A" : "Q",
        false,
      );
      this.cursorKeys.d = this.input.keyboard?.addKey("D", false);

      this.input.keyboard?.removeCapture("SPACE");
    }

    this.input.setTopOnly(true);
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
        this.currentPlayer as BumpkinContainer,
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
        false,
      );
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
}
