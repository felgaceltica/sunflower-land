import { SceneId } from "features/world/mmoMachine";
import { MINIGAME_NAME } from "./util/WhackAMoleConstants";
import mapJsonDark from "./assets/dark.json";
import mapJsonSummer from "./assets/summer.json";
import mapJsonAutumn from "./assets/autumn.json";
import mapJsonWinter from "./assets/winter.json";
import mapJsonSpring from "./assets/spring.json";
//import defaultTilesetConfig from "assets/map/tileset.json";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { MachineInterpreter } from "./lib/WhackAMoleMachine";
import RexGesturePlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { isMobile } from "mobile-device-detect";
import { GameHole } from "./lib/hole";
import { GameState } from "features/game/types/game";
import { getAudioMutedSetting } from "lib/utils/hooks/useIsAudioMuted";
import confetti from "canvas-confetti";
import { getMusicMutedSetting } from "./util/useIsMusicMuted";
import { getDarkModeSetting } from "./util/useIsDarkMode";
import seasonal_tileset from "assets/map/seasonal_tileset.json";
import { WhackNightShaderPipeline } from "./util/WhackAMoleShader";

//import { WhackAMoleShader } from './util/WhackAMoleShader'
export class WhackAMoleScene extends Phaser.Scene {
  sceneId: SceneId = MINIGAME_NAME;
  // gameBoard: Netwalk;
  public map: Phaser.Tilemaps.Tilemap = {} as Phaser.Tilemaps.Tilemap;
  layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
  zoomLevel = 0;
  ZOOM = 0;
  rexGestures: RexGesturePlugin | undefined;
  dragState: any = { active: false, prevPointer: null, start: 0 };
  lastMole = 0;
  holes: GameHole[] = [];
  target = false;
  timeWarning = false;
  gameOverSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  gameStartSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  collectPointSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  targetErrorSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  musicSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  targetReachedSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  timeTickingSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  loseLifeSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  private countdownText?: Phaser.GameObjects.Text;
  private countdownStarted = false;
  constructor() {
    super(MINIGAME_NAME);
  }

  getSeasonMap(season: string) {
    switch (season) {
      case "summer":
        return mapJsonSummer;
      case "autumn":
        return mapJsonAutumn;
      case "winter":
        return mapJsonWinter;
      case "spring":
        return mapJsonSpring;
      default:
        return mapJsonSummer;
    }
  }
  public get gameState() {
    return this.registry.get("gameState") as GameState;
  }

  preload() {
    this.loadSprites();
    this.loadSounds();
    // const factionName = this.gameState.faction?.name as FactionName;
    // console.log(factionName);
    const season = this.gameState.season.season;
    //season = "autumn";
    //console.log(season);
    //const seasons = ["Spring", "Summer", "Autumn", "Winter"];

    let mapJson = this.getSeasonMap(season);
    if (getDarkModeSetting()) {
      mapJson = mapJsonDark;
    }
    const json = {
      ...mapJson,
      tilesets: seasonal_tileset,
    };
    this.load.tilemapTiledJSON("WhackAMolemap", json);
  }

  async create() {
    //this.physics.world.drawDebug = true;
    this.initialiseCamera();
    this.initialiseMap();
    this.initialiseSounds();
    this.updateCameraBounds();
    const audioMuted = getAudioMutedSetting();
    const musicMuted = getMusicMutedSetting();
    if (!musicMuted) {
      this.musicSound?.play({ volume: 0.4 });
    } else {
      this.musicSound?.play({ volume: 0 });
    }
    this.holes.push(new GameHole(this, 192, 128));
    this.holes.push(new GameHole(this, 224, 128));
    this.holes.push(new GameHole(this, 256, 128));
    this.holes.push(new GameHole(this, 192, 160));
    this.holes.push(new GameHole(this, 224, 160));
    this.holes.push(new GameHole(this, 256, 160));
    this.holes.push(new GameHole(this, 192, 192));
    this.holes.push(new GameHole(this, 224, 192));
    this.holes.push(new GameHole(this, 256, 192));

    PubSub.subscribe("changeMap", () => {
      this.ChangeMap();
    });
    const nightShaderPipeline = this.cameras.main.getPostPipeline(
      "night",
    ) as WhackNightShaderPipeline;
    nightShaderPipeline.lightSources = [{ x: 0.475, y: 0.575 }];
    document.fonts.load("16px Teeny");
  }
  private ChangeMap = () => {
    if (this.map) this.map.destroy();

    const season = this.gameState.season.season;
    let mapJson = this.getSeasonMap(season);
    if (getDarkModeSetting()) {
      //console.log('dark');
      mapJson = mapJsonDark;
    }

    const json = {
      ...mapJson,
      tilesets: seasonal_tileset,
    };
    //console.log(this);
    // Limpa o cache antes de recarregar
    this.cache.tilemap?.remove("WhackAMolemap");
    this.load.tilemapTiledJSON("WhackAMolemap", json);
    this.load.once("complete", () => {
      this.initialiseMap();
      this.cameras.main.resetPostPipeline();

      if (getDarkModeSetting()) {
        this.cameras.main.setPostPipeline("night");

        const nightShaderPipeline = this.cameras.main.getPostPipeline(
          "night",
        ) as WhackNightShaderPipeline;
        if (nightShaderPipeline) {
          nightShaderPipeline.lightSources = [{ x: 0.475, y: 0.575 }];
        }
      }
    });

    this.load.start();
  };
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
  private startGameCountdown() {
    this.onCountdownFinished();
    return;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const countdownTexts = ["3", "2", "1", "GO!"];
    let index = 0;

    const showNext = () => {
      if (this.countdownText) {
        this.countdownText.destroy();
        this.countdownText = undefined;
      }

      if (index >= countdownTexts.length) {
        this.onCountdownFinished();
        return;
      }

      this.countdownText = this.add
        .text(centerX - 10, centerY + 15, countdownTexts[index], {
          fontSize: "50px",
          color: index === countdownTexts.length - 1 ? "#00ff00" : "#ffffff",
          fontStyle: "bold",
          fontFamily: "Arial",
          stroke: "#000000",
          strokeThickness: 4,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000000",
            blur: 2,
            fill: true,
          },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(9999)
        .setAlpha(0)
        .setScale(1);
      if (!getAudioMutedSetting()) {
        // Tocar som
        if (index < countdownTexts.length - 1) {
          this.sound.play("beep"); // toca beep nos números 3, 2, 1
        } else {
          this.sound.play("go"); // toca som diferente no GO!
        }
      }
      // Fade in
      this.tweens.add({
        targets: this.countdownText,
        alpha: 1,
        duration: 100,
        onComplete: () => {
          // Scale pulse (aumenta e volta)
          this.tweens.add({
            targets: this.countdownText,
            scale: 1.5,
            duration: 400,
            yoyo: true,
            ease: "Power1",
            onComplete: () => {
              index++;
              showNext();
              // // Fade out
              // this.tweens.add({
              //   targets: this.countdownText,
              //   alpha: 0,
              //   duration: 150,
              //   onComplete: () => {
              //     index++;
              //     showNext();
              //   },
              // });
            },
          });
        },
      });
    };

    showNext();
  }
  private onCountdownFinished() {
    // Coloque aqui o código para iniciar o jogo após o countdown
    // if (!getAudioMutedSetting()) {
    //   this.gameStartSound?.play({ volume: 0.15 });
    // }
    this.portalService?.send("START", { duration: 60000 });
    this.lastMole = this.time.now;
    this.target = false;
    this.timeWarning = false;
  }
  async update(time: number, delta: number) {
    const audioMuted = getAudioMutedSetting();
    const musicMuted = getMusicMutedSetting();

    if (this.isGameReady) {
      if (!this.countdownStarted) {
        this.countdownStarted = true;
        this.startGameCountdown();
      }
    } else {
      this.countdownStarted = false; // reset se sair do ready (opcional)
    }
    if (this.musicSound) {
      if (!musicMuted) {
        this.musicSound.volume = 0.4;
      } else {
        this.musicSound.volume = 0;
      }
    }
    //console.log(this.portalService?.state.context.lives);
    if (this.isGamePlaying) {
      const secondsPassed = !this.portalService?.state.context.startedAt
        ? 0
        : Math.max(
            Date.now() - this.portalService?.state.context.startedAt,
            0,
          ) / 1000;
      // if (secondsPassed <= 10 && !this.timeWarning) {
      //   if (!getAudioMutedSetting()) {
      //     this.timeTickingSound?.play({ volume: 0.8 });
      //   }
      //   this.timeWarning = true;
      // }
      //let fase = 0;
      const fase = Math.floor(secondsPassed / 10) + 1;
      //console.log(fase);
      const nextMole = Math.max(850 - fase * 50, 200);
      //console.log(nextMole);
      // if (secondsPassed < 20) {
      //   fase = 1;
      // } else if (secondsPassed < 40 ) {
      //   fase = 2;
      // } else {
      //   fase = 3;
      // }
      // let nextMole = 999999;
      // switch (fase) {
      //   case 1:
      //     nextMole = 800;
      //     break;
      //   case 2:
      //     nextMole = 600;
      //     break;
      //   case 3:
      //     nextMole = 450;
      //     break;
      //   default:
      //     nextMole = 999999;
      //     break;
      // }
      const moleTime = time - this.lastMole;
      if (moleTime > nextMole) {
        this.lastMole = time;
        let holeIndex = -1;
        const avaiableHoles = [];
        for (let index = 0; index < this.holes.length; index++) {
          if (this.holes[index].getState() == "avaiable") {
            avaiableHoles.push(index);
          }
        }
        if (avaiableHoles.length > 0) {
          const index = Math.floor(Math.random() * avaiableHoles.length);
          holeIndex = avaiableHoles[index];
          this.holes[holeIndex].showMole(fase);
        }
      }
      let currentScore = 0;
      let targetScore = 0;
      if (this.portalService?.state?.context?.score) {
        currentScore = this.portalService?.state?.context?.score;
      }
      if (
        this.portalService?.state?.context?.state?.minigames.prizes[
          "mine-whack"
        ]?.score
      ) {
        targetScore =
          this.portalService?.state?.context?.state?.minigames.prizes[
            "mine-whack"
          ]?.score;
      }
      if (currentScore < targetScore) {
        this.target = false;
      }
      if (!this.target && currentScore >= targetScore) {
        this.target = true;
        if (!getAudioMutedSetting()) {
          if (this.collectPointSound?.isPlaying) this.collectPointSound?.stop();
          if (this.targetErrorSound?.isPlaying) this.targetErrorSound?.stop();
          this.targetReachedSound?.play({ volume: 0.8 });
        }
      }
    }
    //if (!this.isGamePlaying) this.gameBoard.cleanBoard();
    // end game when time is up
    // if (this.isGamePlaying && this.secondsLeft <= 0) {
    //   this.endGame(0);
    // }
    //console.log(this.portalService?.state.context.lives);
    if (
      this.isGamePlaying &&
      this.portalService &&
      this.portalService?.state.context.lives <= 0
    ) {
      this.endGame();
    }
  }
  public endGame = () => {
    let currentScore = 0;
    let targetScore = 0;
    if (this.portalService?.state?.context?.score) {
      currentScore = this.portalService?.state?.context?.score;
    }
    if (
      this.portalService?.state?.context?.state?.minigames.prizes["mine-whack"]
        ?.score
    ) {
      targetScore =
        this.portalService?.state?.context?.state?.minigames.prizes[
          "mine-whack"
        ]?.score;
    }
    if (currentScore >= targetScore) {
      if (!getAudioMutedSetting()) {
        confetti();
        if (this.collectPointSound?.isPlaying) this.collectPointSound?.stop();
        if (this.targetErrorSound?.isPlaying) this.targetErrorSound?.stop();
        this.targetReachedSound?.play({ volume: 0.8 });
      }
    } else {
      if (!getAudioMutedSetting()) {
        if (this.collectPointSound?.isPlaying) this.collectPointSound?.stop();
        if (this.targetErrorSound?.isPlaying) this.targetErrorSound?.stop();
        this.gameOverSound?.play({ volume: 1 });
      }
    }
    this.portalService?.send("GAME_OVER", {
      score: currentScore,
    });
  };

  // public get secondsPassed() {
  //   const startedAt = this.portalService?.state.context.startedAt;
  //   const secondsPassed = !startedAt ? 0 : Math.max(Date.now() - startedAt, 0) / 1000;
  //   return secondsPassed;
  // }

  private initialiseCamera() {
    const camera = this.cameras.main;
    const baseZoom =
      window.innerWidth < window.innerHeight
        ? window.innerWidth
        : window.innerHeight;
    if (isMobile) this.ZOOM = baseZoom / (9 * SQUARE_WIDTH);
    else this.ZOOM = baseZoom / (15 * SQUARE_WIDTH);
    camera.setZoom(this.ZOOM);
    camera.fadeIn();
    //var pipeline = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.add('Night', new WhackAMoleShader(this.game));
    //this.cameras.main.setRenderToTexture(pipeline);
    (
      this.renderer as Phaser.Renderer.WebGL.WebGLRenderer
    ).pipelines.addPostPipeline("night", WhackNightShaderPipeline);
    if (getDarkModeSetting()) {
      this.cameras.main.setPostPipeline("night");
    }
  }

  private loadSprites() {
    this.load.spritesheet("rockmole", "world/whackamole/rockmole.png", {
      frameWidth: 21,
      frameHeight: 22,
    });
    this.load.spritesheet("ironmole", "world/whackamole/ironmole.png", {
      frameWidth: 21,
      frameHeight: 22,
    });
    this.load.spritesheet("goldmole", "world/whackamole/goldmole.png", {
      frameWidth: 21,
      frameHeight: 22,
    });
    this.load.spritesheet("whitebunny", "world/whackamole/whitebunny.png", {
      frameWidth: 21,
      frameHeight: 22,
    });
    this.load.spritesheet("orangebunny", "world/whackamole/orangebunny.png", {
      frameWidth: 21,
      frameHeight: 22,
    });
    this.load.spritesheet("molepoof", "world/whackamole/poof.png", {
      frameWidth: 20,
      frameHeight: 19,
    });
    this.load.bitmapFont(
      "Teeny Tiny Pixls",
      "world/Teeny Tiny Pixls5.png",
      "world/Teeny Tiny Pixls5.xml",
    );
  }
  private loadSounds() {
    this.load.audio("game_start", "world/whackamole/gameStart.mp3");
    this.load.audio("lose_life", "world/whackamole/loseLife.mp3");
    this.load.audio("game_over", "world/whackamole/gameOver.mp3");
    this.load.audio("target_error", "world/whackamole/targetError1.mp3");
    this.load.audio("collect_point", "world/whackamole/collectPoint.mp3");
    this.load.audio("target_achieve", "world/whackamole/targetAchieve.mp3");
    this.load.audio("time_ticking", "world/whackamole/timeTicking.mp3");
    this.load.audio("music", "world/whackamole/music2.mp3");
    this.load.audio("beep", "world/whackamole/beep.mp3");
    this.load.audio("go", "world/whackamole/go.mp3");
  }
  public initialiseMap() {
    this.map = this.make.tilemap({
      key: "WhackAMolemap",
    });

    const tileset = this.map.addTilesetImage(
      "Sunnyside V3",
      "seasonal-tileset",
      16,
      16,
      1,
      2,
    ) as Phaser.Tilemaps.Tileset;
    this.map.layers.forEach((layerData, idx) => {
      const layer = this.map.createLayer(layerData.name, [tileset], 0, 0);
      layer?.setDepth(500);
      this.layers[layerData.name] = layer as Phaser.Tilemaps.TilemapLayer;
    });
    this.cameras.main.centerOn(
      (this.map.width / 2) * SQUARE_WIDTH - SQUARE_WIDTH / 2,
      (this.map.height / 2) * SQUARE_WIDTH - SQUARE_WIDTH / 2,
    );
    this.holes.forEach((data) => {
      data.setDepth(1000);
    });
  }
  private initialiseSounds() {
    if (!this.gameOverSound) this.gameOverSound = this.sound.add("game_over");
    if (!this.gameStartSound)
      this.gameStartSound = this.sound.add("game_start");
    if (!this.targetErrorSound)
      this.targetErrorSound = this.sound.add("target_error");
    if (!this.collectPointSound)
      this.collectPointSound = this.sound.add("collect_point");
    if (!this.targetReachedSound)
      this.targetReachedSound = this.sound.add("target_achieve");
    if (!this.timeTickingSound)
      this.timeTickingSound = this.sound.add("time_ticking");
    if (!this.loseLifeSound) this.loseLifeSound = this.sound.add("lose_life");
    if (!this.musicSound) {
      this.musicSound = this.sound.add("music");
      this.musicSound.loop = true;
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
}
