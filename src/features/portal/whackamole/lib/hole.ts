import weightedRandom from "../util/Utils";
import { WhackAMoleScene } from "../WhackAMoleScene";
import { getAudioMutedSetting } from "lib/utils/hooks/useIsAudioMuted";

export class GameHole {
  protected _scene!: WhackAMoleScene;
  protected _x!: number;
  protected _y!: number;
  protected _hole!: Phaser.GameObjects.Sprite;
  protected _bgSprite!: Phaser.GameObjects.Sprite;
  protected _state = "avaiable";
  protected _mole = "";
  constructor(scene: WhackAMoleScene, x: number, y: number) {
    this._scene = scene;
    this._x = x;
    this._y = y;
    this._bgSprite = this._scene.add
      .sprite(this._x, this._y, "rockmole", 0)
      .setScale(0.85)
      .setOrigin(0, 0);
    this._hole = this._scene.add
      .sprite(this._x, this._y, "rockmole")
      .setScale(0.85)
      .setOrigin(0, 0);
    const circleHitArea = new Phaser.Geom.Circle(10, 12, 12);
    this._hole
      .setInteractive(circleHitArea, Phaser.Geom.Circle.Contains)
      .on("pointerover", () => {
        this._scene.input.setDefaultCursor("pointer");
      })
      .on("pointerout", () => {
        this._scene.input.setDefaultCursor("default");
      })
      .on("pointerup", () => {
        if (
          this._state == "idle" ||
          this._state == "show" ||
          this._state == "hide"
        ) {
          this._hole.anims.stop();
          this._hole.setFrame(0);
          this._state = "dead";
          let points = 0;
          let time = 0;
          switch (this._mole) {
            case "rock":
              points = 5;
              break;
            case "iron":
              points = 10;
              break;
            case "gold":
              points = 15;
              break;
            case "white":
              points = -30;
              time = -5000;
              break;
            case "orange":
              points = -20;
              break;
            default:
              break;
          }
          let streak = 1;
          if (this._scene.portalService && points > 0)
            streak = this._scene.portalService.state.context.streak + 1;
          if (streak > 5) streak = 5;
          this.showFloatingScore(points * streak);
          if (!getAudioMutedSetting()) {
            if (points > 0) {
              this._scene.collectPointSound?.play({ volume: 0.15 });
            } else {
              this._scene.targetErrorSound?.play({ volume: 0.15 });
            }
          }
          this._scene.portalService?.send("GAIN_POINTS", {
            points: points,
            time: time,
          });
          this._hole.anims
            .play("molepoof")
            .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
              this._hole.setFrame(0);
              this._state = "avaiable";
              this._mole = "";
            });
        }
        if (this._state == "avaiable" && this._mole == "") {
          this.showFloatingScore(-10);
          if (!getAudioMutedSetting()) {
            this._scene.targetErrorSound?.play({ volume: 0.15 });
          }
          this._scene.portalService?.send("GAIN_POINTS", {
            points: -10,
            time: 0,
          });
        }
      });
    //drawHitbox(this._scene, this._hole);
    this.setDepth(1000);
    this.createanims();
  }
  setDepth(depth: number) {
    this._bgSprite.setDepth(depth);
    this._hole.setDepth(depth + 1);
  }
  getState() {
    return this._state;
  }
  showMole(fase: number) {
    const moles = ["rock", "iron", "gold", "white", "orange"];
    let weights = [80, 0, 0, 0, 20];
    const duration = Math.max(900 - fase * 40, 150);
    switch (fase) {
      case 1:
      case 2:
        weights = [80, 0, 0, 0, 20];
        break;
      case 3:
      case 4:
        weights = [50, 25, 0, 15, 10];
        break;
      case 5:
      case 6:
        weights = [0, 40, 20, 20, 20];
        break;
      default:
        weights = [0, 15, 25, 30, 30];
        break;
    }
    const nextMole = weightedRandom(moles, weights);
    if (this._state != "avaiable") return;
    switch (nextMole?.item) {
      case "rock":
        this.showrockmole(duration);
        break;
      case "iron":
        this.showironmole(duration);
        break;
      case "gold":
        this.showgoldmole(duration);
        break;
      case "white":
        this.showwhitebunny(duration);
        break;
      case "orange":
        this.showorangebunny(duration);
        break;
      default:
        break;
    }
  }
  private showmole(show: string, idle: string, hide: string, time: number) {
    this._state = "show";
    this._hole
      .play(show)
      .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this._state = "idle";
        this._hole.play(idle);
        setTimeout(() => {
          if (this._state == "idle") {
            this._state = "hide";
            this._hole
              .play(hide)
              .once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                if (
                  this._state == "hide" &&
                  (this._mole == "rock" ||
                    this._mole == "iron" ||
                    this._mole == "gold")
                ) {
                  this._scene.portalService?.send("RESET_STREAK");
                }
                this._state = "avaiable";
                this._mole = "";
              });
          }
        }, time);
      });
  }

  private showrockmole(time: number) {
    this._mole = "rock";
    this.showmole("rockmoleshow", "rockmoleidle", "rockmolehide", time);
  }
  private showironmole(time: number) {
    this._mole = "iron";
    this.showmole("ironmoleshow", "ironmoleidle", "ironmolehide", time);
  }
  private showgoldmole(time: number) {
    this._mole = "gold";
    this.showmole("goldmoleshow", "goldmoleidle", "goldmolehide", time);
  }
  private showwhitebunny(time: number) {
    this._mole = "white";
    this.showmole("whitebunnyshow", "whitebunnyidle", "whitebunnyhide", time);
  }
  private showorangebunny(time: number) {
    this._mole = "orange";
    this.showmole(
      "orangebunnyshow",
      "orangebunnyidle",
      "orangebunnyhide",
      time,
    );
  }
  private showFloatingScore(points: number) {
    const textColor = points > 0 ? "#00ff00" : "#ff0000";
    const prefix = points > 0 ? "+" : "";

    // Arredonda posição para evitar texto borrado
    const x = this._x - 1 + this._hole.width * 0.5;
    const y = this._y + 1;

    const scoreText = this._scene.add.text(x, y, `${prefix}${points}`, {
      fontSize: "10px", // Texto com mais resolução
      fontFamily: "Teeny",
      color: textColor,
      stroke: "#000",
      strokeThickness: 2,
    });

    scoreText.setOrigin(0.5);
    scoreText.setScale(0.5); // Aparece como “8px” visualmente
    scoreText.setDepth(1000);
    //scoreText.setResolution?.(2);       // Se suportado, dobra a nitidez

    this._scene.tweens.add({
      targets: scoreText,
      //y: y - 25,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => {
        scoreText.destroy();
      },
    });
  }
  protected createanims() {
    if (!this._scene.anims.exists("rockmoleshow")) {
      this._scene.anims.create({
        key: "rockmoleshow",
        frames: this._scene.anims.generateFrameNumbers("rockmole", {
          start: 0,
          end: 8,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("rockmoleidle")) {
      this._scene.anims.create({
        key: "rockmoleidle",
        frames: this._scene.anims.generateFrameNumbers("rockmole", {
          start: 9,
          end: 10,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this._scene.anims.exists("rockmolehide")) {
      this._scene.anims.create({
        key: "rockmolehide",
        frames: this._scene.anims.generateFrameNumbers("rockmole", {
          start: 18,
          end: 26,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("ironmoleshow")) {
      this._scene.anims.create({
        key: "ironmoleshow",
        frames: this._scene.anims.generateFrameNumbers("ironmole", {
          start: 0,
          end: 8,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("ironmoleidle")) {
      this._scene.anims.create({
        key: "ironmoleidle",
        frames: this._scene.anims.generateFrameNumbers("ironmole", {
          start: 9,
          end: 10,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this._scene.anims.exists("ironmolehide")) {
      this._scene.anims.create({
        key: "ironmolehide",
        frames: this._scene.anims.generateFrameNumbers("ironmole", {
          start: 18,
          end: 26,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("goldmoleshow")) {
      this._scene.anims.create({
        key: "goldmoleshow",
        frames: this._scene.anims.generateFrameNumbers("goldmole", {
          start: 0,
          end: 8,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("goldmoleidle")) {
      this._scene.anims.create({
        key: "goldmoleidle",
        frames: this._scene.anims.generateFrameNumbers("goldmole", {
          start: 9,
          end: 10,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this._scene.anims.exists("goldmolehide")) {
      this._scene.anims.create({
        key: "goldmolehide",
        frames: this._scene.anims.generateFrameNumbers("goldmole", {
          start: 18,
          end: 26,
        }),
        frameRate: 32,
      });
    }

    if (!this._scene.anims.exists("whitebunnyshow")) {
      this._scene.anims.create({
        key: "whitebunnyshow",
        frames: this._scene.anims.generateFrameNumbers("whitebunny", {
          start: 0,
          end: 8,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("whitebunnyidle")) {
      this._scene.anims.create({
        key: "whitebunnyidle",
        frames: this._scene.anims.generateFrameNumbers("whitebunny", {
          start: 9,
          end: 10,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this._scene.anims.exists("whitebunnyhide")) {
      this._scene.anims.create({
        key: "whitebunnyhide",
        frames: this._scene.anims.generateFrameNumbers("whitebunny", {
          start: 16,
          end: 24,
        }),
        frameRate: 32,
      });
    }

    if (!this._scene.anims.exists("orangebunnyshow")) {
      this._scene.anims.create({
        key: "orangebunnyshow",
        frames: this._scene.anims.generateFrameNumbers("orangebunny", {
          start: 0,
          end: 8,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("orangebunnyidle")) {
      this._scene.anims.create({
        key: "orangebunnyidle",
        frames: this._scene.anims.generateFrameNumbers("orangebunny", {
          start: 9,
          end: 10,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this._scene.anims.exists("orangebunnyhide")) {
      this._scene.anims.create({
        key: "orangebunnyhide",
        frames: this._scene.anims.generateFrameNumbers("orangebunny", {
          start: 16,
          end: 24,
        }),
        frameRate: 32,
      });
    }
    if (!this._scene.anims.exists("molepoof")) {
      this._scene.anims.create({
        key: "molepoof",
        frames: this._scene.anims.generateFrameNumbers("molepoof", {
          start: 2,
          end: 8,
        }),
        repeat: 0,
        frameRate: 10,
      });
    }
  }
}
