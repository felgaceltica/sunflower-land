export class ComboBar {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private levels: number;
  private currentLevel: number;

  private background: Phaser.GameObjects.Graphics;
  private foreground: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width = 200,
    height = 20,
    levels = 5,
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.levels = levels;
    this.currentLevel = 0;

    this.background = scene.add.graphics().setDepth(9999);
    this.foreground = scene.add.graphics().setDepth(9999);

    this.drawBackground();
    this.updateBar();
  }

  private drawBackground(): void {
    const segmentWidth = this.width / this.levels;

    this.background.clear();
    this.background.lineStyle(2, 0xffffff);
    this.background.strokeRect(this.x, this.y, this.width, this.height);

    for (let i = 1; i < this.levels; i++) {
      const lineX = this.x + i * segmentWidth;
      this.background.lineBetween(lineX, this.y, lineX, this.y + this.height);
    }
  }

  private updateBar(): void {
    const segmentWidth = this.width / this.levels;

    this.foreground.clear();
    this.foreground.fillStyle(0xffcc00);
    this.foreground.fillRect(
      this.x,
      this.y,
      segmentWidth * this.currentLevel,
      this.height,
    );
  }

  public incrementCombo(): void {
    if (this.currentLevel < this.levels) {
      this.currentLevel++;
      this.updateBar();
    }
  }

  public resetCombo(): void {
    this.currentLevel = 0;
    this.updateBar();
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public isMaxCombo(): boolean {
    return this.currentLevel === this.levels;
  }
}
