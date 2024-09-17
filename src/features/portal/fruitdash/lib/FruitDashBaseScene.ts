import { SceneId } from "features/world/mmoMachine";
import { MachineInterpreter } from "./FruitDashMachine";
import { FactionName, GameState } from "features/game/types/game";
import { Player } from "features/world/types/Room";
import { NPCName } from "lib/npcs";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { translate } from "lib/i18n/translate";
import { isTouchDevice } from "features/world/lib/device";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
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
  SQUARE_WIDTH_TEXTURE,
  TOTAL_LINES,
} from "../util/FruitDashConstants";
import { getAudioMutedSetting } from "lib/utils/hooks/useIsAudioMuted";
import { MINIGAME_NAME } from "../util/FruitDashConstants";
import { FruitDashGroundFactory } from "./Ground";
import { getAnimationUrl } from "features/world/lib/animations";
import { ITEM_DETAILS } from "features/game/types/images";
import fisherHourglassFull from "assets/factions/boosts/fish_boost_full.webp";
import { SUNNYSIDE } from "assets/sunnyside";
import VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick.js";
import RexGesturePlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

export abstract class FruitDashBaseScene extends Phaser.Scene {
  joystick?: VirtualJoystick;
  rexGestures: RexGesturePlugin | undefined;
  sceneId: SceneId = "fruit_dash";
  speed = INITIAL_SPEED;
  next_speed = INITIAL_SPEED;
  slow_down = false;
  ghost = false;
  currentPlayer: BumpkinContainer | undefined;
  movementAngle: number | undefined;
  isFacingLeft = false;
  walkingSpeed = INITIAL_WALK_SPEED;
  walkAudioController?: WalkAudioController;
  soundEffects: AudioController[] = [];
  groundFactory = new FruitDashGroundFactory(this);
  speedInterval: any;
  gameOverSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  bountySound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  fruitSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  musicSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  leftButton!: Phaser.GameObjects.Image;
  rightButton!: Phaser.GameObjects.Image;
  axeButtonCount!: Phaser.GameObjects.Text;
  axeButton!: Phaser.GameObjects.Container;
  mobileKeys!: {
    left: boolean;
    right: boolean;
  };
  cursorKeys:
    | {
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        a?: Phaser.Input.Keyboard.Key;
        d?: Phaser.Input.Keyboard.Key;
        space?: Phaser.Input.Keyboard.Key;
      }
    | undefined;
  constructor() {
    super(MINIGAME_NAME);
  }
  preload() {
    //sounds: https://mixkit.co/free-sound-effects/game/
    //music: https://www.fesliyanstudios.com/royalty-free-music/downloads-c/8-bit-music/6

    this.load.audio("game_over", "world/fruitdash/game_over.mp3");
    this.load.audio("bounty", "world/fruitdash/bounty.mp3");
    this.load.audio("fruit", "world/fruitdash/fruit.mp3");
    this.load.audio("music", "world/fruitdash/music.mp3");

    this.groundFactory.preload();
    this.load.image("slowdown", fisherHourglassFull);
    this.load.image("Apple", ITEM_DETAILS["Apple"].image);
    this.load.image("Banana", ITEM_DETAILS["Banana"].image);
    this.load.image("Orange", ITEM_DETAILS["Orange"].image);
    this.load.image("Blueberry", ITEM_DETAILS["Blueberry"].image);
    this.load.image("ghost", SUNNYSIDE.resource.magic_mushroom);
    this.load.image("axe", SUNNYSIDE.tools.gold_pickaxe);

    this.load.svg("arrow", "world/fruitdash/arrow.svg");
    this.load.image("axebutton", "world/fruitdash/pickaxe.png");
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
    //this.physics.world.setFPS(30);
    this.physics.world.drawDebug = false;
    this.initialiseCamera();
    this.initialiseSounds();
    this.initialiseControls();
    this.groundFactory.createBaseRoad();
    this.speedInterval = setInterval(() => {
      if (this.isGamePlaying && !this.slow_down) {
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
      x: window.innerWidth / 2,
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
  async update(time: number, delta: number) {
    const speed_factor = delta / (1000 / 60); // 1000 ms / 60fps
    const player_speed_factor = 16 / (1000 / 60); // 1000 ms / 60fps
    this.updatePlayer(player_speed_factor);
    this.groundFactory.update(speed_factor);
    if (this.portalService?.state?.context?.axes && this.axeButtonCount) {
      const currentAxes = this.portalService?.state?.context?.axes;
      this.axeButtonCount.text = currentAxes.toString();
    }
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
    this.walkAudioController = new WalkAudioController(
      this.sound.add("dirt_footstep"),
    );
    this.gameOverSound = this.sound.add("game_over");
    this.bountySound = this.sound.add("bounty");
    this.fruitSound = this.sound.add("fruit");
    this.musicSound = this.sound.add("music");
    this.musicSound.loop = true;
    if (!audioMuted) {
      this.musicSound?.play({ volume: 0.07 });
    }
  }
  public updatePlayer(speed_factor: number) {
    const audioMuted = getAudioMutedSetting();
    if (this.musicSound) {
      if (!audioMuted) {
        this.musicSound.volume = 0.07;
      } else {
        this.musicSound.volume = 0;
      }
    }
    if (!this.currentPlayer?.body) {
      return;
    }
    if (isTouchDevice()) {
      if (this.isGamePlaying) {
        this.leftButton.visible = true;
        this.rightButton.visible = true;
        if (this.portalService?.state?.context?.axes) {
          const currentAxes = this.portalService?.state?.context?.axes;
          this.axeButton.visible = false;
          if (currentAxes > 0) {
            this.axeButton.visible = true;
          }
        } else {
          this.axeButton.visible = false;
        }
      } else {
        this.leftButton.visible = false;
        this.rightButton.visible = false;
        this.axeButton.visible = false;
      }

      this.movementAngle = this.keysToAngle(
        this.mobileKeys.left,
        this.mobileKeys.right,
        false,
        false,
      );

      // // joystick is active if force is greater than zero
      // this.movementAngle = this.joystick?.force
      //   ? this.joystick?.angle
      //   : undefined;
    } else {
      this.movementAngle = undefined;
    }

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
      // let cursorKeys = this.joystick?.createCursorKeys();
      // let left = false;
      // let right = false
      // if(cursorKeys){
      //   left = cursorKeys["left"].isDown;
      //   right = cursorKeys["right"].isDown;
      // }

      const left = this.movementAngle == 180;
      const right = this.movementAngle == 0;

      if (
        (left && this.currentPlayer.x <= PLAYER_MIN_X) ||
        (right && this.currentPlayer.x >= PLAYER_MAX_X)
      ) {
        currentPlayerBody.setVelocity(0, 0);
      } else {
        currentPlayerBody.setVelocity(
          this.walkingSpeed *
            speed_factor *
            Math.cos((this.movementAngle * Math.PI) / 180),
          this.walkingSpeed *
            speed_factor *
            Math.sin((this.movementAngle * Math.PI) / 180),
        );
      }
    } else {
      currentPlayerBody.setVelocity(0, 0);
    }
    if (this.currentPlayer.x < PLAYER_MIN_X) {
      this.currentPlayer.x = PLAYER_MIN_X;
    }
    if (this.currentPlayer.x > PLAYER_MAX_X) {
      this.currentPlayer.x = PLAYER_MAX_X;
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
      this.walkAudioController.handleWalkSound(
        isMoving && !getAudioMutedSetting(),
      );
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
        //this.currentPlayer.x = PLAYER_MIN_X;
      }
      if (this.currentPlayer.x > PLAYER_MAX_X) {
        //this.currentPlayer.x = PLAYER_MAX_X;
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
      // // Initialise joystick
      // const { centerX, centerY, height } = this.cameras.main;
      // this.joystick = new VirtualJoystick(this, {
      //   x: centerX,
      //   y: centerY - 35 + height / ZOOM / 2,
      //   radius: 25,
      //   dir: 'left&right',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
      //   base: this.add.circle(0, 0, 25, 0x000000, 0.2).setDepth(1000000000),
      //   thumb: this.add.circle(0, 0, 10, 0xffffff, 0.2).setDepth(1000000000),
      //   forceMin: 2,
      // });
      // this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      //   this.throwAxe();
      // });
      this.mobileKeys = { left: false, right: false };
      const { x, y, centerX, centerY, width, height } = this.cameras.main;
      // Initialise buttons
      const realWidth = width / ZOOM;
      this.rightButton = this.add
        .image(
          centerX + realWidth / 3.25,
          window.innerHeight / 2 +
            SQUARE_WIDTH_TEXTURE * (TOTAL_LINES / 2 - 3) -
            5,
          "arrow",
        )
        .setScale(0.11, 0.11)
        .setAlpha(0.2)
        .setInteractive()
        .setDepth(1000)
        .on("pointerdown", () => {
          if (this.mobileKeys) {
            this.mobileKeys.right = true;
          }
          this.rightButton.setAlpha(0.8);
        })
        .on("pointerup", () => {
          if (this.mobileKeys) {
            this.mobileKeys.right = false;
          }
          this.rightButton.setAlpha(0.2);
        })
        .on("pointerout", () => {
          if (this.mobileKeys) {
            this.mobileKeys.right = false;
          }
          this.rightButton.setAlpha(0.2);
        });

      this.rightButton.flipX = true;
      this.leftButton = this.add
        .image(
          centerX - realWidth / 3.25,
          window.innerHeight / 2 +
            SQUARE_WIDTH_TEXTURE * (TOTAL_LINES / 2 - 3) -
            5,
          "arrow",
        )
        .setScale(0.11, 0.11)
        .setAlpha(0.2)
        .setInteractive()
        .setDepth(1000)
        .on("pointerdown", () => {
          if (this.mobileKeys) {
            this.mobileKeys.left = true;
          }
          this.leftButton.setAlpha(0.8);
        })
        .on("pointerup", () => {
          if (this.mobileKeys) {
            this.mobileKeys.left = false;
          }
          this.leftButton.setAlpha(0.2);
        })
        .on("pointerout", () => {
          if (this.mobileKeys) {
            this.mobileKeys.left = false;
          }
          this.leftButton.setAlpha(0.2);
        });

      const container = this.add.container(
        centerX,
        window.innerHeight / 2 +
          SQUARE_WIDTH_TEXTURE * (TOTAL_LINES / 2 - 3) -
          5,
      );

      const image = this.add
        .image(0, 0, "axebutton")
        .setScale(0.08, 0.08)
        .setInteractive()
        .on("pointerdown", () => {
          this.throwAxe();
          this.axeButton.setAlpha(0.8);
        })
        .on("pointerup", () => {
          this.axeButton.setAlpha(0.2);
        })
        .on("pointerout", () => {
          this.axeButton.setAlpha(0.2);
        });

      container.add(image);
      container.setAlpha(0.2).setDepth(1000);

      const rect = new Phaser.Geom.Circle(
        (image.width / 2) * image.scaleX,
        (image.height / 2) * image.scaleX * -1,
        8,
      );
      const graphics = new Phaser.GameObjects.Graphics(this, {
        lineStyle: { width: 2, color: 0x000000 },
        fillStyle: { color: 0x000000 },
      });
      //  Draw the now deflated rectangle in yellow
      //graphics.lineStyle(2, 0x000000);
      graphics.strokeCircleShape(rect);
      graphics.setDepth(1000);
      container.add(graphics);
      this.add.text;
      this.axeButtonCount = this.add
        .text(rect.x, rect.y, "0", {
          fontSize: "12px",
          resolution: 4,
          align: "center",
          fontFamily: "monospace",
          //padding: { x: 2, y: 2 },
          color: "#000",
        })
        .setOrigin(0.5, 0.5);
      container.add(this.axeButtonCount);
      this.axeButton = container;

      this.portalService?.send("SET_JOYSTICK_ACTIVE", {
        isJoystickActive: true,
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

      //this.input.keyboard?.removeCapture("SPACE");
      this.cursorKeys.space?.on("down", () => {
        this.throwAxe();
      });
    }

    this.input.setTopOnly(true);
  }

  throwAxe() {
    if (this.portalService?.state?.context?.axes) {
      const currentAxes = this.portalService?.state?.context?.axes;
      if (currentAxes > 0) {
        this.portalService?.send("THROW_AXE");
        this.groundFactory.throwAxe();
      }
    }
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
