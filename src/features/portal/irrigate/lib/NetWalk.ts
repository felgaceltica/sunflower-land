import _ from "lodash";
import { IrrigateScene } from "../IrrigateScene";
import { BOARD_SIZE } from "../util/IrrigateConstants";

interface NetwalkOptions {
  rows?: number;
  columns?: number;
}

class NewWalkVector extends Phaser.Math.Vector2 {
  flag: number;
  opposite: number;
  constructor(x: number, y: number, flag: number, opposite: number) {
    super(x, y);
    this.flag = flag;
    this.opposite = opposite;
  }
}

export class Netwalk {
  private options: Required<NetwalkOptions>;
  //private Dir: { [key: string]: { flag: number; opposite: number } };
  private Dir: Record<string, NewWalkVector>;
  private figures: Record<string, number[]>;
  private board: number[] = [];
  private serverVector: NewWalkVector;
  private neighbours: number[] = [];
  private toDraw: Phaser.Math.Vector2[] = [];
  private toRandomize: Phaser.Math.Vector2[] = [];
  private connectedCells: NewWalkVector[] = [];
  private _scene: IrrigateScene;
  private _boardContainer?: Phaser.GameObjects.Container;
  private TILE_SIZE: number;

  constructor(options: NetwalkOptions = {}, scene: IrrigateScene) {
    this._scene = scene;
    const defaults: Required<NetwalkOptions> = {
      rows: 6,
      columns: 6,
    };

    this.options = { ...defaults, ...options };

    this.Dir = {
      up: new NewWalkVector(0, -1, 1, 2),
      down: new NewWalkVector(0, 1, 2, 1),
      left: new NewWalkVector(-1, 0, 4, 8),
      right: new NewWalkVector(1, 0, 8, 4),
    };

    this.figures = {
      computer: [1, 8, 2, 4],
      server: [17, 24, 18, 20],
      elbow: [9, 10, 6, 5],
      line: [3, 12],
      tee: [13, 11, 14, 7],
    };
    this.TILE_SIZE = BOARD_SIZE / this.options.rows;
    this.serverVector = new NewWalkVector(1, 1, 0, 0);
  }
  public newGame() {
    const { x, y, centerX, centerY, width, height } = this._scene.cameras.main;
    this._boardContainer = this._scene.add.container(
      centerX - BOARD_SIZE / 2,
      centerY - BOARD_SIZE / 2,
    );
    this.buildMatrix();

    this.serverVector = new NewWalkVector(
      1 + _.random(this.options.columns - 2),
      1 + _.random(this.options.rows - 2),
      0,
      0,
    );
    //this.serverVector = new NewWalkVector(1, 1, 0, 0);
    this.putOnBoard(this.serverVector, 16);
    this.generateBoard();
    this.randomize();
    // console.log(this.board);
    // console.log(this.neighbours);
    this.drawBoard();
  }
  private drawBaseBoard() {
    const boardRect = new Phaser.Geom.Rectangle(0, 0, BOARD_SIZE, BOARD_SIZE);
    const graphics = new Phaser.GameObjects.Graphics(this._scene, {
      lineStyle: { width: 1, color: 0x4da76f, alpha: 0.6 },
      fillStyle: { color: 0xff0000, alpha: 0 },
    });
    graphics.alpha = 1;
    graphics.strokeRectShape(boardRect);
    for (let row = 1; row < this.options.rows; row++) {
      const boardLine = new Phaser.Geom.Line(
        0,
        row * this.TILE_SIZE,
        BOARD_SIZE,
        row * this.TILE_SIZE,
      );
      graphics.strokeLineShape(boardLine);
    }
    for (let column = 1; column < this.options.columns; column++) {
      const boardLine = new Phaser.Geom.Line(
        column * this.TILE_SIZE,
        0,
        column * this.TILE_SIZE,
        BOARD_SIZE,
      );
      graphics.strokeLineShape(boardLine);
    }
    this._boardContainer?.add(graphics);
  }
  private drawBoard() {
    this._boardContainer?.removeAll();
    for (let row = 0; row < this.options.rows; row++) {
      for (let column = 0; column < this.options.columns; column++) {
        const imageBoardIndex = row * this.options.rows + column;
        const image = this._scene.add.image(
          column * this.TILE_SIZE,
          row * this.TILE_SIZE,
          this.board[imageBoardIndex].toString(),
        );
        image
          .setScale(this.TILE_SIZE / image.width, this.TILE_SIZE / image.height)
          .setOrigin(0, 0)
          .setInteractive()
          .on("pointerup", () => {
            this.rotate(imageBoardIndex);
            this.drawBoard();
          });
        this._boardContainer?.add(image);
      }
    }
    this.drawBaseBoard();
    //this._boardContainer.
  }

  private rotate(cell: number): void {
    let className, figure;
    figure = this.board[cell];
    figure = this.turnFigure(figure);
    this.board[cell] = figure;
  }

  private randomize(): void {
    while (this.toRandomize.length != 0) {
      let figure, j;
      const i = _.random(this.toRandomize.length - 1);
      const vector = this.toRandomize[i];
      const cell = this.getCellByVector(vector);
      figure = this.board[cell];
      j = _.random(3);
      while (j) {
        figure = this.turnFigure(figure);
        --j;
      }
      this.board[cell] = figure;
      this.toRandomize.splice(i, 1);
    }
  }

  private turnFigure(figure: number): number {
    let figureIndex, figures, newFigure, newFigureIndex;
    newFigure = 0;
    const type = this.typeOfFigure(figure);
    if (type != null) {
      figures = this.figures[type];
      figureIndex = _.indexOf(figures, figure);
      newFigureIndex = ++figureIndex < figures.length ? figureIndex : 0;
      newFigure = figures[newFigureIndex];
    }
    return newFigure;
  }

  private typeOfFigure(figure: number): string | null {
    let type;
    for (type in this.figures) {
      if (_.indexOf(this.figures[type], figure) !== -1) {
        return type;
      }
    }
    return null;
  }

  private buildMatrix(): void {
    this.board = Array(this.options.columns! * this.options.rows!).fill(0);
    this.neighbours = Array(this.options.columns! * this.options.rows!).fill(0);
    this.toDraw = [];
    this.toRandomize = [];
    this.connectedCells = [];
    for (let i = 0; i < this.options.columns!; i++) {
      for (let j = 0; j < this.options.rows!; j++) {
        const vector = new Phaser.Math.Vector2(i, j);
        const cell = this.getCellByVector(vector);
        this.board[cell] = 0;
        this.neighbours[cell] = 0;
        for (const d in this.Dir) {
          const nvector = this.addVector(vector, this.Dir[d]);
          if (this.inBounds(nvector)) {
            this.neighbours[cell] |= this.Dir[d].flag;
          }
        }
      }
    }
  }

  private putOnBoard(vector: Phaser.Math.Vector2, directionBit: number) {
    const cell = this.getCellByVector(vector);
    if (this.board[cell] === 0) {
      this.toDraw.push(vector);
      this.toRandomize.push(vector);
    }
    this.board[cell] |= directionBit;
    for (const d in this.Dir) {
      const nvector = this.addVector(vector, this.Dir[d]);
      const ncell = this.getCellByVector(nvector);
      if (this.inBounds(nvector)) {
        this.neighbours[ncell] &= ~this.Dir[d].opposite;
      }
    }
  }

  private inBounds(vector: Phaser.Math.Vector2): boolean {
    const x = vector.x;
    const y = vector.y;
    return (
      x >= 0 && y >= 0 && x < this.options.columns && y < this.options.rows
    );
  }

  private generateBoard(): void {
    while (this.toDraw.length != 0) {
      let madeConnection = false;
      while (!madeConnection && this.toDraw.length > 0) {
        const i = _.random(this.toDraw.length - 1);
        const vector = this.toDraw[i];
        const cell = this.getCellByVector(vector);
        const d = this.randomFreeDir(cell);
        if (d) {
          this.putOnBoard(vector, d.flag);
          this.putOnBoard(this.addVector(vector, d), d.opposite);
          madeConnection = true;
        }
        if ((this.neighbours[cell] & 15) === 0) {
          this.toDraw.splice(i, 1);
        }
      }
    }
  }

  private getCellByVector(v: Phaser.Math.Vector2): number {
    return v.x + v.y * this.options.columns;
  }

  randomFreeDir(cell: number): NewWalkVector | null {
    const map = this.neighbours[cell];
    const figure = this.board[cell];
    const numOfCables = this.numOfCables(cell);
    if (figure & 16 && numOfCables > 0) {
      return null;
    }
    if (numOfCables === 3) {
      return null;
    }
    const i = _.random(this.directionsInMap(map));
    for (const d in this.Dir) {
      if (map & this.Dir[d].flag && i - 1 === 0) {
        return this.Dir[d];
      }
    }
    return null;
  }

  private numOfCables(cell: number): number {
    const cablesMap = this.board[cell];
    let count = 0;
    for (const d in this.Dir) {
      if (cablesMap & this.Dir[d].flag) {
        count++;
      }
    }
    return count;
  }

  private directionsInMap(neighboursMap: number): number {
    let count = 0;
    for (const d in this.Dir) {
      if (neighboursMap & this.Dir[d].flag) {
        count++;
      }
    }
    return count;
  }

  private addVector(
    vector1: Phaser.Math.Vector2,
    vector2: Phaser.Math.Vector2,
  ) {
    return new Phaser.Math.Vector2(
      vector1.x + vector2.x,
      vector1.y + vector2.y,
    );
  }
}
