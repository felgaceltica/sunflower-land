import mapJson from "assets/map/farmer_football.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "features/world/scenes/BaseScene";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { FARMER_FOOTBALL_NPCS } from "./lib/types";
import { SPAWNS } from "features/world/lib/spawn";
import PubSub from "pubsub-js";
import { Room } from "colyseus.js";
import { FarmerFootballRoomState } from "./lib/FarmerFootballRoomState";

export class FarmerFootballScene extends BaseScene {
  graphics: any;
  lastBallState: any;
  sceneId: SceneId = "farmer_football";
  ball: any;
  packetSentAt = 0;
  isSending = false;
  leftQueueText: any;
  leftScoreText: any;
  rightQueueText: any;
  rightScoreText: any;
  statusText: any;
  debugText: any;
  debugMode = true;
  inTheField = false;
  readyToPlay = false;
  waitingConfirmation = false;
  positionTag: any;
  pingTimer: any;
  pingTime = 0;
  lastPingTime = 0;
  lastBallChanged = 0;
  lastUpdateMoment = 0;
  forcedUpdateMoment = 0;
  isWaiting4ActualUpdateEvent = true;
  goalSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  whistle1Sound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  whistle2Sound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  bounceSound?:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  // gameAssets = {sfx: {
  //   goal: {},
  //   whistle1: {},
  //   whistle2: {},
  //   bounce: {}
  // }}
  constructor() {
    super({
      name: "farmer_football",
      map: { json: mapJson, padding: [10, 10] },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }
  public get farmerFootballMmoServer() {
    return this.registry.get("mmoServer") as Room<FarmerFootballRoomState>;
  }

  preload() {
    super.preload();
    //authorisePortal();
    //this.load.path = "./public/";
    this.load.image("ball", "world/farmerfootball/ball.png");
    this.load.image("leftgoal", "world/farmerfootball/leftgoal.png");
    this.load.image("rightgoal", "world/farmerfootball/rightgoal.png");
    this.load.image("donate", "world/farmerfootball/donate.png");
    this.load.audio("goal", "world/farmerfootball/goal.mp3");
    this.load.audio("whistle1", "world/farmerfootball/whistle1.mp3");
    this.load.audio("whistle2", "world/farmerfootball/whistle2.mp3");
    this.load.audio("kick", "world/farmerfootball/kick.mp3");
    this.load.image("blueBanner", "world/farmerfootball/blueBanner.png");
    this.load.image("redBanner", "world/farmerfootball/redBanner.png");
    // Ambience SFX
    // if (!this.sound.get("nature_1")) {
    //   const nature1 = this.sound.add("nature_1");
    //   nature1.play({ loop: true, volume: 0.01 });
    // }

    // Shut down the sound when the scene changes
    this.events.once("shutdown", () => {
      this.sound.getAllPlaying().forEach((sound) => {
        sound.destroy();
      });
    });
  }

  async create() {
    const server = this.farmerFootballMmoServer;
    this.map = this.make.tilemap({
      key: "farmer_football",
    });
    super.create();
    this.physics.world.drawDebug = false;

    this.setupBasicPhysics(this);
    this.setupBall(this);
    this.drawField(this);
    this.drawObstacles(this);
    this.createNPCs();
    if (server) {
      server.onMessage("countdown", (message) => {
        if (message >= 0) {
          this.statusText.text = "MATCH STARTING IN " + message;
        }
      });
      server.onMessage("abandon", (message) => {
        if (message == "left" && server.state.rightTeam.has(server.sessionId)) {
          this.ReSpawPlayer();
          PubSub.publish("showBlueAbandonModal");
        }
        if (message == "right" && server.state.leftTeam.has(server.sessionId)) {
          this.ReSpawPlayer();
          PubSub.publish("showRedAbandonModal");
        }
      });
      server.onMessage("goal", (message) => {
        if (this.goalSound) this.goalSound.play();
      });
      server.onMessage("whistle", (message) => {
        if (message == 1) {
          if (this.whistle1Sound) this.whistle1Sound.play();
        }
      });
      server.onMessage("winner", (message) => {
        if (message.players.indexOf(server.sessionId) != -1) {
          this.ReSpawPlayer();
          if (message.side == "left") {
            PubSub.publish("showWinnerModalBlue");
          } else {
            PubSub.publish("showWinnerModalRed");
          }
        }
      });
      server.onMessage("loser", (message) => {
        if (message.players.indexOf(server.sessionId) != -1) {
          this.ReSpawPlayer();
          if (message.side == "left") {
            PubSub.publish("showLoserModalBlue");
          } else {
            PubSub.publish("showLoserModalRed");
          }
        }
      });
      // server.onMessage("ballPosition", (ballPosition) => {
      //   this.updateBallPosition(ballPosition);
      // });
      server.onMessage("pingResponse", (dados) => {
        this.PingResponse(dados);
      });
      if (this.currentPlayer) {
        this.positionTag = this.createPlayerText({
          x: 0,
          y: 0,
          text: ``,
          color: "#fee761",
        });
        this.positionTag.name = "positionTag";
        this.positionTag.setPosition(
          0,
          16 + (this.currentPlayer.list.length - 3) * 4,
        );

        this.currentPlayer.add(this.positionTag);
      }
    }
    PubSub.subscribe("joinRedTeam", () => {
      this.JoinRedTeam();
    });
    PubSub.subscribe("leaveRedTeam", () => {
      this.LeaveRedTeam();
    });
    PubSub.subscribe("readyRedTeam", () => {
      this.ReadyRedTeam();
    });
    PubSub.subscribe("joinBlueTeam", () => {
      this.JoinBlueTeam();
    });
    PubSub.subscribe("leaveBlueTeam", () => {
      this.LeaveBlueTeam();
    });
    PubSub.subscribe("readyBlueTeam", () => {
      this.ReadyBlueTeam();
    });

    this.statusText = this.add
      .text(16 * 5.5, 16 * 0.5, "", {
        fontSize: "7px",
        fontFamily: "Teeny",
        resolution: 4,
        align: "left",
        //padding: { x: 2, y: 2 },
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.debugText = this.add.text(16 * 11 + 2, 16 * 7.5, "debugText", {
      fontSize: "3px",
      resolution: 4,
      align: "left",
      //padding: { x: 2, y: 2 },
      color: "#000",
    });

    this.leftQueueText = this.add
      .text(16 * 2 - 2, 16 * 10 + 3.1, "QUEUE: 0", {
        fontSize: "2.8px",
        backgroundColor: "#FFF",
        resolution: 4,
        fixedHeight: 3,
        fixedWidth: 20,
        align: "left",
        padding: { top: 0.25, left: 0.4 },
        color: "#0095E9",
      })
      .setDepth(99999999);

    this.rightQueueText = this.add
      .text(16 * 19 - 2, 16 * 10 + 3.1, "QUEUE: 0", {
        fontSize: "2.8px",
        backgroundColor: "#FFF",
        resolution: 4,
        fixedHeight: 3,
        fixedWidth: 20,
        align: "left",
        padding: { top: 0.25, left: 0.4 },
        color: "#FF0000",
      })
      .setDepth(99999999);

    ((this.goalSound = this.sound.add("goal")),
      (this.whistle1Sound = this.sound.add("whistle1")),
      (this.whistle2Sound = this.sound.add("whistle2")),
      (this.bounceSound = this.sound.add("kick")));
    if (this.debugMode) {
      this.pingTimer = this.time.addEvent({
        callback: this.PingServer,
        callbackScope: this,
        delay: 500,
        loop: true,
      });
    }
    setInterval(() => {
      this.awayUpdate();
    }, 1000);
  }
  PingServer() {
    const server = this.farmerFootballMmoServer;
    const dados = {
      tick: new Date().getUTCMilliseconds(),
    };
    if (server) server.send("ping", dados);
  }
  PingResponse(dados: any) {
    const pingTime = new Date().getUTCMilliseconds() - dados.tick;
    if (pingTime > 0) {
      this.pingTime = pingTime;
    }
  }
  ReSpawPlayer() {
    this.readyToPlay = false;
    this.inTheField = false;
    if (this.currentPlayer) {
      this.currentPlayer.x = SPAWNS().farmer_football.default.x;
      this.currentPlayer.y = SPAWNS().farmer_football.default.y;
    }
  }
  JoinRedTeam() {
    const server = this.mmoServer;
    if (server) {
      server.send(2, this.mmoServer.sessionId);
    }
  }
  LeaveRedTeam() {
    const server = this.mmoServer;
    if (server) {
      server.send(3, this.mmoServer.sessionId);
    }
  }
  ReadyRedTeam() {
    const server = this.mmoServer;
    if (server) {
      this.readyToPlay = true;
      server.send(6, this.mmoServer.sessionId);
    }
  }
  JoinBlueTeam() {
    const server = this.mmoServer;
    if (server) {
      server.send(4, this.mmoServer.sessionId);
    }
  }
  LeaveBlueTeam() {
    const server = this.mmoServer;
    if (server) {
      server.send(5, this.mmoServer.sessionId);
    }
  }
  ReadyBlueTeam() {
    const server = this.mmoServer;
    if (server) {
      server.send(7, this.mmoServer.sessionId);
      this.readyToPlay = true;
    }
  }
  awayUpdate() {
    if (this.lastUpdateMoment > this.forcedUpdateMoment + 5000) {
      this.forcedUpdateMoment = this.lastUpdateMoment;
    } else {
      this.update(this.forcedUpdateMoment + 10000, 10000);
      this.forcedUpdateMoment = this.lastUpdateMoment;
    }
  }
  update(t: number, dt: number) {
    this.lastUpdateMoment = t;
    if (this.isWaiting4ActualUpdateEvent) {
      this.forcedUpdateMoment = this.lastUpdateMoment;
      this.isWaiting4ActualUpdateEvent = false;
    }
    const server = this.farmerFootballMmoServer;
    if (server) {
      if (this.inTheField) {
        if (this.currentPlayer) {
          if (server.state.leftTeam.has(server.sessionId)) {
            if (this.currentPlayer.x < 16 * 3) this.currentPlayer.x = 16 * 3;
            if (this.currentPlayer.x > 16 * 9.5)
              this.currentPlayer.x = 16 * 9.5;
          }
          if (server.state.rightTeam.has(server.sessionId)) {
            if (this.currentPlayer.x < 16 * 12.5)
              this.currentPlayer.x = 16 * 12.5;
            if (this.currentPlayer.x > 16 * 19) this.currentPlayer.x = 16 * 19;
          }
          if (
            server.state.leftTeam.has(server.sessionId) ||
            server.state.rightTeam.has(server.sessionId)
          ) {
            if (this.currentPlayer.y < 16 * 1.6)
              this.currentPlayer.y = 16 * 1.6;
            if (this.currentPlayer.y > 16 * 8.2)
              this.currentPlayer.y = 16 * 8.2;
          }
        }
      }
      this.updatePlayer();
      if (this.lastBallChanged < server.state.ballChanged) {
        const ballPosition = {
          ballPositionX: server.state.ballX,
          ballPositionY: server.state.ballY,
          ballVelocityX: server.state.ballVX,
          ballVelocityY: server.state.ballVY,
        };
        this.updateBallPosition(ballPosition);
      }
      this.calculateQueuePosition();
      if (Date.now() - this.packetSentAt > 1000 / 60) {
        this.isSending = false;
      }
      this.leftScoreText.text = server.state.scoreLeft;
      this.rightScoreText.text = server.state.scoreRight;
      //console.log(server.state.matchState);
      switch (server.state.matchState) {
        case "waiting":
          this.statusText.text = "WAITING FOR PLAYERS";
          break;
        case "counting":
          this.ball.rotation += 0.01;
          break;
        case "playing":
          this.ball.rotation += 0.01;
          this.statusText.text = "";
          break;
        case "leftAbandon":
        case "rightAbandon":
          this.statusText.text = "MATCH RESTARTING";
          this.waitingConfirmation = false;
          break;
        default:
          this.statusText.text = "";
          break;
      }

      this.managePlayersOnField();
      //this.updateBallPosition();
      this.updateOtherPlayers();
      if (this.debugMode) {
        // if (
        //   this.lastPingTime != 0 &&
        //   this.lastPingTime != server.state.currentTime
        // ) {
        //   this.pingTime = server.state.currentTime - this.lastPingTime;
        // }
        // this.lastPingTime = server.state.currentTime;
        this.debugText.text = [
          "Debug Info:",
          "ping: " + this.pingTime,
          "matchState: " + server.state.matchState,
          "leftTeam: " + server.state.leftTeam.size,
          "leftQueue: " + server.state.leftQueue.size,
          "rightTeam: " + server.state.rightTeam.size,
          "rightQueue: " + server.state.rightQueue.size,
          // "sessionId: " + server.sessionId,
          // "inTheField: " + this.inTheField,
          // "readyToPlay: " + this.readyToPlay,
          // "waitingConfirmation: " + this.waitingConfirmation
        ];
      } else {
        this.debugText.text = "";
      }
    }
  }
  calculateQueuePosition() {
    const server = this.farmerFootballMmoServer;
    if (server) {
      let position = 0;
      let color = "black";
      let index = 0;
      if (
        server.state.rightTeam.has(server.sessionId) ||
        server.state.rightQueue.has(server.sessionId) ||
        server.state.leftTeam.has(server.sessionId) ||
        server.state.leftQueue.has(server.sessionId)
      ) {
        if (server.state.rightTeam.has(server.sessionId)) {
          index = 0;
          if (server.state.matchState != "playing") {
            server.state.rightTeam.forEach((value, at) => {
              if (value == server.sessionId) {
                position = index + 1;
                color = "#FF0000";
              }
              index++;
            });
          }
        } else {
          index = 0;
          server.state.rightQueue.forEach((value, at) => {
            if (value == server.sessionId) {
              position = index + 1;
              color = "#FF0000";
            }
            index++;
          });
          if (server.state.matchState != "playing") {
            position = position + server.state.rightTeam.size;
          }
        }
        if (server.state.leftTeam.has(server.sessionId)) {
          index = 0;
          if (server.state.matchState != "playing") {
            server.state.leftTeam.forEach((value, at) => {
              if (value == server.sessionId) {
                position = index + 1;
                color = "#0095E9";
              }
              index++;
            });
          }
        } else {
          index = 0;
          server.state.leftQueue.forEach((value, at) => {
            if (value == server.sessionId) {
              position = index + 1;
              color = "#0095E9";
            }
            index++;
          });
          if (server.state.matchState != "playing") {
            position = position + server.state.leftTeam.size;
          }
        }
      }
      if (position > 0) {
        this.positionTag.text = `QUEUE POSITION: ${position}`;
        this.positionTag.setColor(color);
        this.positionTag.visible = true;
      } else {
        this.positionTag.visible = false;
      }
    }
    let leftQueueSize = server.state.leftQueue.size;
    let rightQueueSize = server.state.rightQueue.size;
    if (server.state.matchState != "playing") {
      leftQueueSize += server.state.leftTeam.size;
      rightQueueSize += server.state.rightTeam.size;
    }
    this.leftQueueText.text = "QUEUE: " + leftQueueSize;
    this.rightQueueText.text = "QUEUE: " + rightQueueSize;
  }
  managePlayersOnField() {
    const server = this.farmerFootballMmoServer;
    switch (server.state.matchState) {
      case "waiting":
        this.waitingConfirmation = false;
        this.readyToPlay = false;
        break;
      case "starting":
        if (
          server.state.rightTeam.has(server.sessionId) &&
          !this.readyToPlay &&
          !this.waitingConfirmation
        ) {
          this.waitingConfirmation = true;
          PubSub.publish("showReadyRedModal");
        }
        if (
          server.state.leftTeam.has(server.sessionId) &&
          !this.readyToPlay &&
          !this.waitingConfirmation
        ) {
          this.waitingConfirmation = true;
          PubSub.publish("showReadyBlueModal");
        }
        break;
      case "countdown":
        break;
    }
    if (this.currentPlayer) {
      if (
        server.state.leftTeam.has(server.sessionId) &&
        !this.inTheField &&
        this.readyToPlay
      ) {
        this.inTheField = true;
        this.currentPlayer.x = 16 * 8;
        this.currentPlayer.y = 16 * 5;
      }
      if (
        server.state.rightTeam.has(server.sessionId) &&
        !this.inTheField &&
        this.readyToPlay
      ) {
        this.inTheField = true;
        this.currentPlayer.x = 16 * 14;
        this.currentPlayer.y = 16 * 5;
      }
    }
  }
  updateBallPosition(ballPosition: any) {
    const server = this.farmerFootballMmoServer;
    this.lastBallChanged = server.state.ballChanged;
    this.ball.setPosition(
      ballPosition.ballPositionX,
      ballPosition.ballPositionY,
    );
    this.ball.body.setVelocity(
      ballPosition.ballVelocityX,
      ballPosition.ballVelocityY,
    );
    if (server.state.matchState == "playing") {
      if (this.bounceSound) this.bounceSound.play();
    }
  }

  createNPCs() {
    new BumpkinContainer({
      scene: this,
      x: 16 * 19.5,
      y: 16 * 10.75,
      clothing: {
        ...FARMER_FOOTBALL_NPCS.RedTeamNPC,
        updatedAt: 0,
      },
      direction: "left",
      onClick: () => {
        const server = this.farmerFootballMmoServer;
        if (
          server.state.rightTeam.has(server.sessionId) ||
          server.state.rightQueue.has(server.sessionId)
        ) {
          PubSub.publish("showLeaveRedModal");
        } else if (
          server.state.leftQueue.has(server.sessionId) ||
          server.state.leftTeam.has(server.sessionId)
        ) {
          PubSub.publish("showAnotherTeamRedModal");
        } else {
          PubSub.publish("showJoinRedModal");
        }
      },
    });
    new BumpkinContainer({
      scene: this,
      x: 16 * 2.5,
      y: 16 * 10.75,
      clothing: {
        ...FARMER_FOOTBALL_NPCS.BlueTeamNPC,
        updatedAt: 0,
      },
      direction: "right",
      onClick: () => {
        const server = this.farmerFootballMmoServer;
        if (
          server.state.leftTeam.has(server.sessionId) ||
          server.state.leftQueue.has(server.sessionId)
        ) {
          PubSub.publish("showLeaveBlueModal");
        } else if (
          server.state.rightQueue.has(server.sessionId) ||
          server.state.rightTeam.has(server.sessionId)
        ) {
          PubSub.publish("showAnotherTeamBlueModal");
        } else {
          PubSub.publish("showJoinBlueModal");
        }
      },
    });
    // new BumpkinContainer({
    //   scene: this,
    //   x: 16 * 2.5,
    //   y: 16 * 10.75,
    //   clothing: {
    //     ...FARMER_FOOTBALL_NPCS.DonationNPC,
    //     updatedAt: 0,
    //   },
    //   direction: "right",
    //   onClick: () => {
    //       PubSub.publish("showDonationModal");
    //   },
    // });
  }

  sendBallPositionToServer() {
    if (!this.currentPlayer) {
      return;
    }
    this.isSending = true;
    const ballPosition = {
      ballPositionX: this.ball.x,
      ballPositionY: this.ball.y,
      ballVelocityX: this.ball.body.velocity.x,
      ballVelocityY: this.ball.body.velocity.y,
    };
    this.lastBallState = ballPosition;
    this.packetSentAt = Date.now();
    const server = this.mmoServer;
    if (server) {
      server.send(1, ballPosition);
      this.lastBallChanged++;
    }
  }

  resetBall() {
    if (this.whistle1Sound) this.whistle1Sound.play();
    this.ball.setPosition(16 * 11, 16 * 5);
    this.time.delayedCall(100, () => {
      const angle = Phaser.Math.Between(0, 360);
      const vec = this.physics.velocityFromAngle(angle, 80);
      this.ball.body.setVelocity(vec.x, vec.y);
    });
  }

  stopPlayer() {
    if (this.currentPlayer) {
      (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(
        false,
      );
    }
  }
  bounceBall() {
    if (this.currentPlayer) {
      (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(
        true,
      );
    }
    //this.sendBallPositionToServer();
  }
  bounceBallSound() {
    if (this.currentPlayer) {
      (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(
        true,
      );
    }
    if (this.bounceSound) this.bounceSound.play();
    this.sendBallPositionToServer();
  }
  setupBasicPhysics(scene: FarmerFootballScene) {
    scene.physics.world.setBounds(16, 16, 16 * 20, 16 * 12);

    if (scene.currentPlayer) {
      // enable no GameObject (Container/Sprite/etc)
      scene.physics.world.enable(
        scene.currentPlayer as Phaser.GameObjects.GameObject,
        Phaser.Physics.Arcade.DYNAMIC_BODY,
      );

      const body = scene.currentPlayer.body as Phaser.Physics.Arcade.Body;

      body.setImmovable(true).setCircle(7).setBounce(1, 1).setOffset(2, 3);
    }

    scene.add
      .line(0, 0, 16 * 11 + 0.5, 16 * 5, 16 * 11 + 0.5, 16 * 13, 0xffffff, 1)
      .setLineWidth(0.5, 0.5);
  }
  setupBall(scene: FarmerFootballScene) {
    scene.ball = scene.physics.add.image(116, 56, "ball");
    scene.ball.setDisplaySize(8, 8);
    scene.ball.body.setCircle(10);
    scene.ball.body.setBounce(1, 1);
    scene.ball.body.setMaxSpeed(120);
    //scene.ball.body.setCollideWorldBounds(true, 1, 1);
    scene.ball.body.onWorldBounds = true;
    scene.physics.add.existing(scene.ball);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBallSound,
      undefined,
      scene,
    );
    this.ball.setDepth(9999);
  }
  drawObstacles(scene: FarmerFootballScene) {
    const rectblueteam = this.add.rectangle(
      16 * 2.5,
      16 * 11,
      16 * 1.5,
      16 * 1.5,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rectblueteam, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectblueteam as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rectbluebox = this.add.rectangle(
      16 * 4,
      16 * 9.5,
      16 * 1,
      16 * 1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rectbluebox, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectbluebox as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rectredteam = this.add.rectangle(
      16 * 19.5,
      16 * 11,
      16 * 1.5,
      16 * 1.5,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rectredteam, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectredteam as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rectredbox = this.add.rectangle(
      16 * 18,
      16 * 9.5,
      16 * 1,
      16 * 1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rectredbox, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectredbox as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );
  }
  drawField(scene: FarmerFootballScene) {
    scene.add.image(16 * 9.5, 16 * 0.5, "blueBanner").setDisplaySize(8, 17);
    scene.add.image(16 * 12.5, 16 * 0.5, "redBanner").setDisplaySize(8, 17);
    this.leftScoreText = this.add
      .text(16 * 9.56, 16 * 0.55, "0", {
        fontSize: "7px",
        fontFamily: "Teeny",
        resolution: 4,
        align: "center",
        //padding: { x: 2, y: 2 },
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.rightScoreText = this.add
      .text(16 * 12.56, 16 * 0.55, "0", {
        fontSize: "7px",
        fontFamily: "Teeny",
        resolution: 4,
        align: "center",
        //padding: { x: 2, y: 2 },
        color: "#ffffff",
      })
      .setOrigin(0.5);

    //create field lines
    scene.add
      .rectangle(16 * 11, 16 * 5, 288, 128, 0xffffff, 0)
      .setStrokeStyle(1, 0xffffff, 1);
    scene.add
      .circle(16 * 11, 16 * 5, 20, 0xffffff, 0)
      .setStrokeStyle(1, 0xffffff, 1);
    scene.add
      .circle(16 * 11, 16 * 5, 2, 0xffffff, 1)
      .setStrokeStyle(1, 0xffffff, 1);
    scene.add
      .line(0, 0, 16 * 11 + 0.5, 16 * 5, 16 * 11 + 0.5, 16 * 13, 0xffffff, 1)
      .setLineWidth(0.5, 0.5);

    scene.add
      .graphics()
      .lineStyle(1, 0xffffff, 1)
      .beginPath()
      .arc(
        16 * 2,
        16 * 1,
        4,
        Phaser.Math.DegToRad(0),
        Phaser.Math.DegToRad(90),
        false,
      )
      .strokePath();
    scene.add
      .graphics()
      .lineStyle(1, 0xffffff, 1)
      .beginPath()
      .arc(
        16 * 2,
        16 * 9,
        4,
        Phaser.Math.DegToRad(270),
        Phaser.Math.DegToRad(0),
        false,
      )
      .strokePath();
    scene.add
      .graphics()
      .lineStyle(1, 0xffffff, 1)
      .beginPath()
      .arc(
        16 * 20,
        16 * 1,
        4,
        Phaser.Math.DegToRad(90),
        Phaser.Math.DegToRad(180),
        false,
      )
      .strokePath();
    scene.add
      .graphics()
      .lineStyle(1, 0xffffff, 1)
      .beginPath()
      .arc(
        16 * 20,
        16 * 9,
        4,
        Phaser.Math.DegToRad(180),
        Phaser.Math.DegToRad(270),
        false,
      )
      .strokePath();
    scene.add
      .image(16 * 1 + 10, 16 * 5, "leftgoal")
      .setDisplaySize(12, 40)
      .setDepth(99999);
    scene.add
      .image(16 * 20 + 6, 16 * 5, "rightgoal")
      .setDisplaySize(12, 40)
      .setDepth(99999);
    const donateimage = scene.add
      .image(16 * 16, 16 * 0.6, "donate")
      .setDisplaySize(77, 11)
      .setDepth(99999);
    donateimage.setInteractive({ useHandCursor: true });

    donateimage.on("pointerdown", () => {
      PubSub.publish("showDonationModal");
    });

    const rect = this.add.rectangle(16 * 2, 16 * 2.42, 0.1, 43.5, 0xffffff, 0);
    scene.physics.add.existing(rect, true);
    scene.physics.add.collider(
      rect as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene,
    );
    scene.physics.add.collider(
      rect as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rect1 = this.add.rectangle(
      16 * 20,
      16 * 2.42,
      0.1,
      43.5,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rect1, true);
    scene.physics.add.collider(
      rect1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene,
    );
    scene.physics.add.collider(
      rect1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rect2 = this.add.rectangle(16 * 2, 16 * 7.58, 0.1, 43.5, 0xffffff, 0);
    scene.physics.add.existing(rect2, true);
    scene.physics.add.collider(
      rect2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene,
    );
    scene.physics.add.collider(
      rect2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rect3 = this.add.rectangle(
      16 * 20,
      16 * 7.58,
      0.1,
      43.5,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rect3, true);
    scene.physics.add.collider(
      rect3 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene,
    );
    scene.physics.add.collider(
      rect3 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rect5 = this.add.rectangle(
      16 * 11,
      16 * 1,
      16 * 20,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rect5, true);
    scene.physics.add.collider(
      rect5 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene,
    );
    scene.physics.add.collider(
      rect5 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rect6 = this.add.rectangle(
      16 * 11,
      16 * 9,
      16 * 18,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rect6, true);
    scene.physics.add.collider(
      rect6 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene,
    );
    scene.physics.add.collider(
      rect6 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    const rect7 = this.add.rectangle(
      16 * 11,
      16 * 9.2,
      16 * 20,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rect7, true);
    scene.physics.add.collider(
      rect7 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene,
    );

    // const rect8 = this.add.rectangle(
    //   16 * 2.5,
    //   16 * 5,
    //   0.1,
    //   16 * 8,
    //   0xffffff,
    //   0
    // );
    // scene.physics.add.existing(rect8, true);
    // scene.physics.add.collider(
    //   scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   rect8 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   scene.stopPlayer,
    //   undefined,
    //   scene
    // );

    // const rect9 = this.add.rectangle(
    //   16 * 10.5,
    //   16 * 5,
    //   0.1,
    //   16 * 8,
    //   0xffffff,
    //   0
    // );
    // scene.physics.add.existing(rect9, true);
    // scene.physics.add.collider(
    //   scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   rect9 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   scene.stopPlayer,
    //   undefined,
    //   scene
    // );
    // const rect10 = this.add.rectangle(
    //   16 * 11.5,
    //   16 * 5,
    //   0.1,
    //   16 * 8,
    //   0xffffff,
    //   0
    // );
    // scene.physics.add.existing(rect10, true);
    // scene.physics.add.collider(
    //   scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   rect10 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   scene.stopPlayer,
    //   undefined,
    //   scene
    // );
    // const rect11 = this.add.rectangle(
    //   16 * 19.5,
    //   16 * 5,
    //   0.1,
    //   16 * 8,
    //   0xffffff,
    //   0
    // );
    // scene.physics.add.existing(rect11, true);
    // scene.physics.add.collider(
    //   scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   rect11 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   scene.stopPlayer,
    //   undefined,
    //   scene
    // );

    const leftgoal = this.add.rectangle(16 * 1.3, 16 * 5, 0.1, 40, 0xffffff, 0);
    scene.physics.add.existing(leftgoal, true);
    scene.physics.add.overlap(
      leftgoal as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addRightGoal,
      undefined,
      scene,
    );
    const leftgoal1 = this.add.rectangle(
      16 * 1.6,
      16 * 3.3,
      6,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(leftgoal1, true);
    scene.physics.add.overlap(
      leftgoal1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addRightGoal,
      undefined,
      scene,
    );
    const leftgoal2 = this.add.rectangle(
      16 * 1.6,
      16 * 6.7,
      6,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(leftgoal2, true);
    scene.physics.add.overlap(
      leftgoal2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addRightGoal,
      undefined,
      scene,
    );

    const rightgoal = this.add.rectangle(
      16 * 20.7,
      16 * 5,
      0.1,
      40,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rightgoal, true);
    scene.physics.add.overlap(
      rightgoal as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addLeftGoal,
      undefined,
      scene,
    );
    const rightgoal1 = this.add.rectangle(
      16 * 20.4,
      16 * 3.3,
      6,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rightgoal1, true);
    scene.physics.add.overlap(
      rightgoal1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addLeftGoal,
      undefined,
      scene,
    );
    const rightgoal2 = this.add.rectangle(
      16 * 20.4,
      16 * 6.7,
      6,
      0.1,
      0xffffff,
      0,
    );
    scene.physics.add.existing(rightgoal2, true);
    scene.physics.add.overlap(
      rightgoal2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addLeftGoal,
      undefined,
      scene,
    );
  }

  addLeftGoal() {
    this.ball.body.stop();
    this.ball.setPosition(16 * 11, 16 * 5);
    const server = this.farmerFootballMmoServer;
    if (server) {
      if (
        server.state.leftTeam.has(server.sessionId) ||
        server.state.rightTeam.has(server.sessionId)
      ) {
        server.send(8);
      }
    }
  }
  addRightGoal() {
    this.ball.body.stop();
    this.ball.setPosition(16 * 11, 16 * 5);
    const server = this.farmerFootballMmoServer;
    if (server) {
      if (
        server.state.leftTeam.has(server.sessionId) ||
        server.state.rightTeam.has(server.sessionId)
      ) {
        server.send(9);
      }
    }
  }
}
