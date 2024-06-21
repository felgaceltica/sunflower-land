import mapJson from "./farmersoccer.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "features/world/scenes/BaseScene";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { FARMER_SOCCER_NPCS } from "./lib/types";
import { SPAWNS } from "features/world/lib/spawn";
import PubSub from "pubsub-js";

export class FarmerSoccerScene extends BaseScene {
  graphics: any;
  lastBallState: any;
  sceneId: SceneId = "farmer_soccer";
  ball: ImageWithDynamicBody;
  packetSentAt = 0;
  isSending = false;
  leftScoreText: any;
  rightScoreText: any;
  statusText: any;
  inTheField = false;
  readyToPlay = false;
  waitingConfirmation = false;
  positionTag: any;
  gameAssets = {
    sfx: {
      goal: Phaser.Sound.HTML5AudioSound,
      whistle1: Phaser.Sound.HTML5AudioSound,
      whistle2: Phaser.Sound.HTML5AudioSound,
      kick: Phaser.Sound.HTML5AudioSound,
    },
  };
  constructor() {
    super({
      name: "farmer_soccer",
      map: { json: mapJson, padding: [10, 10] },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  preload() {
    super.preload();
    //authorisePortal();
    //this.load.path = "./public/";
    this.load.image(
      "ball",
      "/src/features/portal/farmersoccer/assets/ball.png"
    );
    this.load.image(
      "leftgoal",
      "/src/features/portal/farmersoccer/assets/leftgoal.png"
    );
    this.load.image(
      "rightgoal",
      "/src/features/portal/farmersoccer/assets/rightgoal.png"
    );
    this.load.image(
      "donate",
      "/src/features/portal/farmersoccer/assets/donate.png"
    );
    this.load.audio(
      "goal",
      "/src/features/portal/farmersoccer/assets/goal.wav"
    );
    this.load.audio(
      "whistle1",
      "/src/features/portal/farmersoccer/assets/whistle1.wav"
    );
    this.load.audio(
      "whistle2",
      "/src/features/portal/farmersoccer/assets/whistle2.wav"
    );
    this.load.audio(
      "kick",
      "/src/features/portal/farmersoccer/assets/kick.wav"
    );
    this.load.image(
      "blueBanner",
      "/src/features/portal/farmersoccer/assets/blueBanner.png"
    );
    this.load.image(
      "redBanner",
      "/src/features/portal/farmersoccer/assets/redBanner.png"
    );
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
    const server = this.mmoServer;
    this.map = this.make.tilemap({
      key: "farmer_soccer",
    });
    super.create();
    this.physics.world.drawDebug = true;
    this.gameAssets.sfx.goal = this.sound.add("goal");
    this.gameAssets.sfx.whistle1 = this.sound.add("whistle1");
    this.gameAssets.sfx.whistle2 = this.sound.add("whistle2");
    this.gameAssets.sfx.kick = this.sound.add("kick");
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
        this.gameAssets.sfx.goal.play();
      });
      server.onMessage("whistle", (message) => {
        if (message == 1) {
          this.gameAssets.sfx.whistle1.play();
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
      server.onMessage("ballPosition", (ballPosition) => {
        this.updateBallPosition(ballPosition);
      });
      this.positionTag = this.createPlayerText({
        x: 0,
        y: 0,
        text: ``,
        color: "#fee761",
      });
      this.positionTag.name = "positionTag";
      this.currentPlayer.add(this.positionTag);
      this.positionTag.setPosition(
        0,
        16 + (this.currentPlayer.list.length - 4) * 4
      );
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
  }
  ReSpawPlayer() {
    this.readyToPlay = false;
    this.inTheField = false;
    this.currentPlayer.x = SPAWNS().farmer_soccer.default.x;
    this.currentPlayer.y = SPAWNS().farmer_soccer.default.y;
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

  update() {
    const server = this.mmoServer;
    if (this.inTheField) {
      if (server.state.leftTeam.has(server.sessionId)) {
        if (this.currentPlayer.x < 16 * 3) this.currentPlayer.x = 16 * 3;
        if (this.currentPlayer.x > 16 * 9.5) this.currentPlayer.x = 16 * 9.5;
      }
      if (server.state.rightTeam.has(server.sessionId)) {
        if (this.currentPlayer.x < 16 * 12.5) this.currentPlayer.x = 16 * 12.5;
        if (this.currentPlayer.x > 16 * 19) this.currentPlayer.x = 16 * 19;
      }
      if (
        server.state.leftTeam.has(server.sessionId) ||
        server.state.rightTeam.has(server.sessionId)
      ) {
        if (this.currentPlayer.y < 16 * 1.6) this.currentPlayer.y = 16 * 1.6;
        if (this.currentPlayer.y > 16 * 8.2) this.currentPlayer.y = 16 * 8.2;
      }
    }
    this.updatePlayer();
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
        break;
      default:
        this.statusText.text = "";
        break;
    }

    this.managePlayersOnField();
    //this.updateBallPosition();
    this.updateOtherPlayers();
  }
  calculateQueuePosition() {
    let position = 0;
    let color = "black";
    const server = this.mmoServer;
    let index = 0;
    if (
      server.state.rightTeam.has(server.sessionId) ||
      server.state.rightQueue.has(server.sessionId) ||
      server.state.leftTeam.has(server.sessionId) ||
      server.state.leftQueue.has(server.sessionId)
    ) {
      if (server.state.matchState != "playing") {
        server.state.rightTeam.forEach((value, at) => {
          if (value == server.sessionId) {
            position = index + 1;
            color = "#FF0000";
          }
          index++;
        });
      }
      index = 0;
      server.state.rightQueue.forEach((value, at) => {
        if (value == server.sessionId) {
          position = index + 1 + server.state.rightTeam.size;
          color = "#FF0000";
        }
        index++;
      });
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
      index = 0;
      server.state.leftQueue.forEach((value, at) => {
        if (value == server.sessionId) {
          position = index + 1 + server.state.leftTeam.size;
          color = "#0095E9";
        }
        index++;
      });
    }
    if (position > 0) {
      this.positionTag.text = `QUEUE POSITION: ${position}`;
      this.positionTag.setColor(color);
      this.positionTag.visible = true;
    } else {
      this.positionTag.visible = false;
    }
  }
  managePlayersOnField() {
    const server = this.mmoServer;
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
  updateBallPosition(ballPosition: any) {
    const server = this.mmoServer;
    this.ball.setPosition(
      ballPosition.ballPositionX,
      ballPosition.ballPositionY
    );
    this.ball.body.setVelocity(
      ballPosition.ballVelocityX,
      ballPosition.ballVelocityY
    );
    if (server.state.matchState == "playing") {
      this.gameAssets.sfx.kick.play();
    }
  }

  createNPCs() {
    new BumpkinContainer({
      scene: this,
      x: 16 * 19.5,
      y: 16 * 10.75,
      clothing: {
        ...FARMER_SOCCER_NPCS.RedTeamNPC,
        updatedAt: 0,
      },
      direction: "left",
      onClick: () => {
        const server = this.mmoServer;
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
        ...FARMER_SOCCER_NPCS.BlueTeamNPC,
        updatedAt: 0,
      },
      direction: "right",
      onClick: () => {
        const server = this.mmoServer;
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
    //     ...FARMER_SOCCER_NPCS.DonationNPC,
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
    }
  }

  resetBall() {
    this.gameAssets.sfx.whistle1.play();
    this.ball.setPosition(16 * 11, 16 * 5);
    this.time.delayedCall(100, () => {
      const angle = Phaser.Math.Between(0, 360);
      const vec = this.physics.velocityFromAngle(angle, 80);
      this.ball.body.setVelocity(vec.x, vec.y);
    });
  }

  stopPlayer() {
    (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(false);
  }
  bounceBall() {
    (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    //this.sendBallPositionToServer();
  }
  bounceBallSound() {
    (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.gameAssets.sfx.kick.play();
    this.sendBallPositionToServer();
  }
  setupBasicPhysics(scene: FarmerSoccerScene) {
    scene.physics.world.setBounds(16, 16, 16 * 20, 16 * 12);
    (scene.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (scene.currentPlayer.body as Phaser.Physics.Arcade.Body)
      .setCircle(7)
      .setBounce(1, 1)
      .setOffset(2, 3);
    scene.physics.world.enable(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );
    scene.add
      .line(0, 0, 16 * 11 + 0.5, 16 * 5, 16 * 11 + 0.5, 16 * 13, 0xffffff, 1)
      .setLineWidth(0.5, 0.5);
  }
  setupBall(scene: FarmerSoccerScene) {
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
      scene
    );
    this.ball.setDepth(9999);
  }
  drawObstacles(scene: FarmerSoccerScene) {
    const rectblueteam = this.add.rectangle(
      16 * 2.5,
      16 * 11,
      16 * 1.5,
      16 * 1.5,
      0xffffff,
      0
    );
    scene.physics.add.existing(rectblueteam, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectblueteam as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rectbluebox = this.add.rectangle(
      16 * 4,
      16 * 9.5,
      16 * 1,
      16 * 1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rectbluebox, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectbluebox as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rectredteam = this.add.rectangle(
      16 * 19.5,
      16 * 11,
      16 * 1.5,
      16 * 1.5,
      0xffffff,
      0
    );
    scene.physics.add.existing(rectredteam, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectredteam as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rectredbox = this.add.rectangle(
      16 * 18,
      16 * 9.5,
      16 * 1,
      16 * 1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rectredbox, true);
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      rectredbox as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );
  }
  drawField(scene: FarmerSoccerScene) {
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
        false
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
        false
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
        false
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
        false
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
      scene
    );
    scene.physics.add.collider(
      rect as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rect1 = this.add.rectangle(
      16 * 20,
      16 * 2.42,
      0.1,
      43.5,
      0xffffff,
      0
    );
    scene.physics.add.existing(rect1, true);
    scene.physics.add.collider(
      rect1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene
    );
    scene.physics.add.collider(
      rect1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rect2 = this.add.rectangle(16 * 2, 16 * 7.58, 0.1, 43.5, 0xffffff, 0);
    scene.physics.add.existing(rect2, true);
    scene.physics.add.collider(
      rect2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene
    );
    scene.physics.add.collider(
      rect2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rect3 = this.add.rectangle(
      16 * 20,
      16 * 7.58,
      0.1,
      43.5,
      0xffffff,
      0
    );
    scene.physics.add.existing(rect3, true);
    scene.physics.add.collider(
      rect3 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene
    );
    scene.physics.add.collider(
      rect3 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rect5 = this.add.rectangle(
      16 * 11,
      16 * 1,
      16 * 20,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rect5, true);
    scene.physics.add.collider(
      rect5 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene
    );
    scene.physics.add.collider(
      rect5 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rect6 = this.add.rectangle(
      16 * 11,
      16 * 9,
      16 * 18,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rect6, true);
    scene.physics.add.collider(
      rect6 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBall,
      undefined,
      scene
    );
    scene.physics.add.collider(
      rect6 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
    );

    const rect7 = this.add.rectangle(
      16 * 11,
      16 * 9.2,
      16 * 20,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rect7, true);
    scene.physics.add.collider(
      rect7 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.stopPlayer,
      undefined,
      scene
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
      scene
    );
    const leftgoal1 = this.add.rectangle(
      16 * 1.6,
      16 * 3.3,
      6,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(leftgoal1, true);
    scene.physics.add.overlap(
      leftgoal1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addRightGoal,
      undefined,
      scene
    );
    const leftgoal2 = this.add.rectangle(
      16 * 1.6,
      16 * 6.7,
      6,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(leftgoal2, true);
    scene.physics.add.overlap(
      leftgoal2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addRightGoal,
      undefined,
      scene
    );

    const rightgoal = this.add.rectangle(
      16 * 20.7,
      16 * 5,
      0.1,
      40,
      0xffffff,
      0
    );
    scene.physics.add.existing(rightgoal, true);
    scene.physics.add.overlap(
      rightgoal as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addLeftGoal,
      undefined,
      scene
    );
    const rightgoal1 = this.add.rectangle(
      16 * 20.4,
      16 * 3.3,
      6,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rightgoal1, true);
    scene.physics.add.overlap(
      rightgoal1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addLeftGoal,
      undefined,
      scene
    );
    const rightgoal2 = this.add.rectangle(
      16 * 20.4,
      16 * 6.7,
      6,
      0.1,
      0xffffff,
      0
    );
    scene.physics.add.existing(rightgoal2, true);
    scene.physics.add.overlap(
      rightgoal2 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.addLeftGoal,
      undefined,
      scene
    );
  }

  addLeftGoal() {
    this.ball.body.stop();
    this.ball.setPosition(16 * 11, 16 * 5);
    const server = this.mmoServer;
    if (server) {
      //if (server.state.leftTeam.has(server.sessionId)) {
      server.send(8);
      //}
    }
  }
  addRightGoal() {
    this.ball.body.stop();
    this.ball.setPosition(16 * 11, 16 * 5);
    const server = this.mmoServer;
    if (server) {
      //if (server.state.rightTeam.has(server.sessionId)) {
      server.send(9);
      //}
    }
  }
}
