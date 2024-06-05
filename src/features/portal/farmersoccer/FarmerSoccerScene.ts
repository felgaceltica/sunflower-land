import mapJson from "./farmersoccer.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "features/world/scenes/BaseScene";
import { Clothing } from "./lib/types";
import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
export const GoblinNPC1: Clothing = {
  body: "Goblin Potion",
  hat: "",
  hair: "Sun Spots",
  shirt: "Red Farmer Shirt",
  pants: "Farmer Pants",
  tool: "",
};
export const GoblinNPC2: Clothing = {
  body: "Goblin Potion",
  hat: "",
  hair: "Fire Hair",
  shirt: "Clown Shirt",
  pants: "Farmer Pants",
  tool: "",
};
const SEND_PACKET_RATE = 1;
// import {
//   authorisePortal,
//   goHome,
// } from "features/portal/examples/cropBoom/lib/portalUtil";

export class FarmerSoccerScene extends BaseScene {
  graphics: any;
  lastBallState: any;
  paths: Phaser.Curves.Path[] = [];
  followers = [];
  NPCs: BumpkinContainer[] = [];
  sceneId: SceneId = "farmer_soccer";
  ball: ImageWithDynamicBody;
  packetSentAt = 0;
  isSending = false;
  leftScoreText: any;
  rightScoreText: any;
  leftScore = 0;
  rightScore = 0;
  gameAssets = {
    sfx: {
      goal: Phaser.Sound.HTML5AudioSound,
      whistle1: Phaser.Sound.NoAudioSound,
      whistle2: Phaser.Sound.NoAudioSound,
      kick: Phaser.Sound.NoAudioSound,
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
    // this.addGoblin1(this);
    // this.addGoblin2(this);
    if (this.mmoServer) {
      // this.mmoServer.state.actions.onAdd(async (action) => {
      //   if (action.event === "kaboom") {
      //     this.kaboom(action.x as number, action.y as number, "otherPlayer");
      //   }
      // });
    }
    // this.time.delayedCall(1000, () => {
    //   this.resetBall();
    // });
  }
  addGoblin1(scene: FarmerSoccerScene) {
    let index = scene.NPCs.push(
      new BumpkinContainer({
        scene: scene,
        x: 16 * 12,
        y: 16 * 4,
        clothing: {
          ...GoblinNPC1,
          updatedAt: 0,
        },
        direction: "left",
      })
    );
    index--;
    (scene.NPCs[index].body as Phaser.Physics.Arcade.Body)
      .setCircle(7)
      .setOffset(2, 3)
      .setImmovable(true)
      .setBounce(1, 1)
      .setCollideWorldBounds(true);
    scene.physics.world.enable(
      scene.NPCs[index] as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      0
    );
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.NPCs[index],
      scene.stopPlayer,
      undefined,
      scene
    );
    scene.physics.add.collider(
      scene.NPCs[index] as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBallSound,
      undefined,
      scene
    );

    scene.graphics = scene.add.graphics();

    scene.paths.push(new Phaser.Curves.Path(16 * 19, 16 * 2.5));
    scene.paths[index].splineTo([
      16 * 17,
      16 * 1.8,
      16 * 15,
      16 * 2.2,
      16 * 12,
      16 * 2,
      16 * 14,
      16 * 4,
      16 * 16,
      16 * 3.5,
      16 * 17,
      16 * 5,
      16 * 18.5,
      16 * 7,
      16 * 19.5,
      16 * 5,
      16 * 19,
      16 * 2.5,
    ]);
    scene.followers.push({ t: 0, vec: new Phaser.Math.Vector2() });
    scene.tweens.add({
      targets: this.followers[index],
      t: 1,
      ease: "Sine.Circ",
      duration: 10000,
      yoyo: false,
      repeat: -1,
    });
  }
  addGoblin2(scene: FarmerSoccerScene) {
    let index = scene.NPCs.push(
      new BumpkinContainer({
        scene: scene,
        x: 16 * 12,
        y: 16 * 4,
        clothing: {
          ...GoblinNPC2,
          updatedAt: 0,
        },
        direction: "left",
      })
    );
    index--;
    (scene.NPCs[index].body as Phaser.Physics.Arcade.Body)
      .setCircle(7)
      .setOffset(2, 3)
      .setImmovable(true)
      .setBounce(1, 1)
      .setCollideWorldBounds(true);
    scene.physics.world.enable(
      scene.NPCs[index] as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      0
    );
    scene.physics.add.collider(
      scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.NPCs[index],
      scene.stopPlayer,
      undefined,
      scene
    );
    scene.physics.add.collider(
      scene.NPCs[index] as Phaser.Types.Physics.Arcade.ArcadeColliderType,
      scene.ball,
      scene.bounceBallSound,
      undefined,
      scene
    );

    scene.graphics = scene.add.graphics();

    scene.paths.push(new Phaser.Curves.Path(16 * 16.5, 16 * 8.5));
    scene.paths[index].splineTo([
      16 * 19,
      16 * 6.5,
      16 * 19,
      16 * 4,
      16 * 16,
      16 * 6,
      16 * 12.5,
      16 * 4,
      16 * 13,
      16 * 6,
      16 * 12,
      16 * 7.5,
      16 * 16.5,
      16 * 8.5,
    ]);
    scene.followers.push({ t: 0, vec: new Phaser.Math.Vector2() });
    scene.tweens.add({
      targets: this.followers[index],
      t: 1,
      ease: "Sine.Circ",
      duration: 10000,
      yoyo: false,
      repeat: -1,
    });
  }
  update() {
    this.updatePlayer();
    this.leftScoreText.text = this.leftScore;
    this.rightScoreText.text = this.rightScore;
    this.ball.rotation += 0.01;
    // this.graphics.clear();
    // this.graphics.lineStyle(0.5, 0xffffff, 1);
    // this.graphics.fillStyle(0xff0000, 1);
    // for (let i = 0; i < this.paths.length; i++) {
    //   if (this.physics.world.drawDebug) this.paths[i].draw(this.graphics);

    //   this.paths[i].getPoint(this.followers[i].t, this.followers[i].vec);

    //   this.NPCs[i].setPosition(
    //     this.followers[i].vec.x,
    //     this.followers[i].vec.y
    //   );
    // }

    //this.graphics.fillCircle(this.follower.vec.x, this.follower.vec.y, 12);
    this.updateBallPosition();
    this.updateOtherPlayers();
  }
  updateBallPosition() {
    const server = this.mmoServer;
    if (!server) return;
    if (
      typeof this.lastBallState == "undefined" ||
      server.state.ballPositionX != this.lastBallState.ballPositionX ||
      server.state.ballPositionY != this.lastBallState.ballPositionY
    ) {
      const ballPosition = {
        ballPositionX: server.state.ballPositionX,
        ballPositionY: server.state.ballPositionY,
        ballVelocityX: server.state.ballVelocityX,
        ballVelocityY: server.state.ballVelocityY,
      };
      this.lastBallState = ballPosition;
      this.ball.setPosition(
        server.state.ballPositionX,
        server.state.ballPositionY
      );
      this.ball.body.setVelocity(
        server.state.ballVelocityX,
        server.state.ballVelocityY
      );
    }
  }
  sendBallPositionToServer() {
    if (!this.currentPlayer) {
      return;
    }
    if (
      // Hasn't sent to server recently
      //  Date.now() - this.packetSentAt > 1000 / 1
      !this.isSending
    ) {
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
      this.time.delayedCall(1000 / 3, () => {
        this.isSending = false;
      });
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
  }
  bounceBallSound() {
    (this.currentPlayer.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.gameAssets.sfx.kick.play();
    this.sendBallPositionToServer();
  }
  setupBasicPhysics(scene: FarmerSoccerScene) {
    scene.physics.world.setBounds(16, 16, 320, 128);
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
    // const rect1 = this.add.rectangle(16 * 11, 16 * 5, 0.1, 16 * 8, 0xffffff, 0);
    // scene.physics.add.existing(rect1, true);
    // scene.physics.add.collider(
    //   rect1 as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   scene.currentPlayer as Phaser.Types.Physics.Arcade.ArcadeColliderType,
    //   scene.stopPlayer,
    //   undefined,
    //   scene
    // );
  }
  setupBall(scene: FarmerSoccerScene) {
    scene.ball = scene.physics.add.image(116, 56, "ball");
    scene.ball.setDisplaySize(8, 8);
    scene.ball.body.setCircle(10);
    scene.ball.body.setBounce(1, 1);
    scene.ball.body.setMaxSpeed(120);
    scene.ball.body.setCollideWorldBounds(true, 1, 1);
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
  drawField(scene: FarmerSoccerScene) {
    this.leftScoreText = this.add
      .text(16 * 9.55, 16 * 0.4, "0", {
        fontSize: "7px",
        fontFamily: "Teeny",
        resolution: 4,
        align: "center",
        //padding: { x: 2, y: 2 },
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.rightScoreText = this.add
      .text(16 * 12.55, 16 * 0.4, "0", {
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
    this.gameAssets.sfx.goal.play();
    this.leftScore++;
    this.ball.body.stop();
    this.ball.setPosition(16 * 11, 16 * 1);
    this.time.delayedCall(3000, () => {
      //this.resetBall();
    });
  }
  addRightGoal() {
    this.rightScore++;
    this.gameAssets.sfx.goal.play();
    this.ball.body.stop();
    this.ball.setPosition(16 * 11, 16 * 1);
    this.time.delayedCall(3000, () => {
      //this.resetBall();
    });
  }
}
