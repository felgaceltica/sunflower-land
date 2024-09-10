import _ from "lodash";
import { IrrigateScene } from "../IrrigateScene";
import { SQUARE_WIDTH } from "features/game/lib/constants";

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
  private options: Required<NetwalkOptions> = { rows: 9, columns: 9 };
  //private Dir: { [key: string]: { flag: number; opposite: number } };
  private Dir: Record<string, NewWalkVector>;
  private figures: Record<string, number[]>;
  private board: number[] = [];
  private solution: number[] = [];
  private serverVector: NewWalkVector;
  private neighbours: number[] = [];
  private toDraw: Phaser.Math.Vector2[] = [];
  private toRandomize: Phaser.Math.Vector2[] = [];
  //private connectedCells: NewWalkVector[] = [];
  private _scene: IrrigateScene;
  private _boardContainer?: Phaser.GameObjects.Container;
  private TILE_SIZE: number;
  private connectedCells: number[] = [];
  private minMoves = 0;
  private totalMoves = 0;
  private boardSize = 0;
  private duration = 0;

  constructor(scene: IrrigateScene) {
    this._scene = scene;

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
    this.TILE_SIZE = SQUARE_WIDTH * 2;
    this.serverVector = new NewWalkVector(1, 1, 0, 0);
    this.connectedCells = [];
  }
  public newGame(difficulty: number) {
    switch (difficulty) {
      case 1: //easy
        this.options.rows = 5;
        this.options.columns = 5;
        this.duration = 90 * 1000;
        break;
      case 2: //medium
        this.options.rows = 7;
        this.options.columns = 7;
        this.duration = 180 * 1000;
        break;
      case 3: //hard
        this.options.rows = 9;
        this.options.columns = 9;
        this.duration = 300 * 1000;
        break;
      default:
        this.options.rows = 9;
        this.options.columns = 9;
        this.duration = 300 * 1000;
        break;
    }
    this.boardSize = this.options.rows * SQUARE_WIDTH * 2;

    this.cleanBoard();
    this._boardContainer = this._scene.add.container(
      (this._scene.map.width / 2 - this.options.rows) * SQUARE_WIDTH,
      (this._scene.map.height / 2 - this.options.columns) * SQUARE_WIDTH,
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
    this.calculateMinimumMoves();
    // console.log(this.board);
    // console.log(this.neighbours);
    this.drawBoard();
    if (this._scene.isGameReady) {
      this._scene.portalService?.send("START", {
        duration: this.duration,
        totalMoves: this.totalMoves,
      });
    }
  }
  public cleanBoard() {
    if (this._boardContainer) {
      this._boardContainer.removeAll(true);
      this._boardContainer.destroy(true);
    }
  }
  private calculateMinimumMoves() {
    this.minMoves = 0;
    for (let index = 0; index < this.board.length; index++) {
      let figure = this.board[index];
      if (figure == this.solution[index]) continue;
      while (figure != this.solution[index]) {
        figure = this.turnFigure(figure);
        this.minMoves = this.minMoves + 1;
      }
    }
    const precision = 80;
    this.totalMoves = Math.round(this.minMoves * (1 + (100 - precision) / 100));
  }
  private drawBaseBoard() {
    this._boardContainer?.setPosition(
      (this._scene.map.width / 2 - this.options.rows) * SQUARE_WIDTH,
      (this._scene.map.height / 2 - this.options.columns) * SQUARE_WIDTH,
    );
    // const boardRect = new Phaser.Geom.Rectangle(0, 0, this.boardSize, this.boardSize);
    // const graphics = new Phaser.GameObjects.Graphics(this._scene, {
    //   lineStyle: { width: 1, color: 0x4da76f, alpha: 0.6 },
    //   fillStyle: { color: 0x63C74D, alpha: 1 },
    // });
    // graphics.alpha = 1;
    // graphics.fillRectShape(boardRect);
    // this._boardContainer?.add(graphics);
  }
  private drawBoardLines() {
    const boardRect = new Phaser.Geom.Rectangle(
      0,
      0,
      this.boardSize,
      this.boardSize,
    );
    const graphics = new Phaser.GameObjects.Graphics(this._scene, {
      lineStyle: { width: 1, color: 0x4da76f, alpha: 0.6 },
      fillStyle: { color: 0x63c74d, alpha: 1 },
    });
    graphics.alpha = 1;
    graphics.strokeRectShape(boardRect);
    for (let row = 1; row < this.options.rows; row++) {
      const boardLine = new Phaser.Geom.Line(
        0,
        row * this.TILE_SIZE,
        this.boardSize,
        row * this.TILE_SIZE,
      );
      graphics.strokeLineShape(boardLine);
    }
    for (let column = 1; column < this.options.columns; column++) {
      const boardLine = new Phaser.Geom.Line(
        column * this.TILE_SIZE,
        0,
        column * this.TILE_SIZE,
        this.boardSize,
      );
      graphics.strokeLineShape(boardLine);
    }
    this._boardContainer?.add(graphics);
  }
  private updateConnectedCells(): void {
    this.connectedCells = [];
    this.getConnectedNeighbours(this.serverVector);
  }

  private getConnectedNeighbours(
    vector: Phaser.Math.Vector2,
    exceptDirection: number | null = null,
    level = 0,
  ) {
    const cell = this.getCellByVector(vector);
    const figure = this.board[cell];
    const type = this.typeOfFigure(figure);

    if (level > this.board.length) return;
    if (type === "computer") {
      return;
    }
    for (const d in this.Dir) {
      if (figure & this.Dir[d].flag) {
        const neighbourVector = this.addVector(vector, this.Dir[d]);
        if (this.Dir[d].flag === exceptDirection) {
          continue;
        }
        if (!this.inBounds(neighbourVector)) {
          continue;
        }

        const neighbourCell = this.getCellByVector(neighbourVector);
        const neighbourFigure = this.board[neighbourCell];
        if (neighbourFigure & this.Dir[d].opposite) {
          if (this.connectedCells.indexOf(neighbourCell) == -1)
            this.connectedCells.push(neighbourCell);
          this.getConnectedNeighbours(
            neighbourVector,
            this.Dir[d].opposite,
            level + 1,
          );
        }
      }
    }
  }

  private drawBoard() {
    this._boardContainer?.removeAll(true);

    this._scene.tweens.killAll();
    this.updateConnectedCells();
    this.drawBaseBoard();
    for (let row = 0; row < this.options.rows; row++) {
      for (let column = 0; column < this.options.columns; column++) {
        const imageBoardIndex = row * this.options.rows + column;
        let sptriteKey = this.board[imageBoardIndex].toString();
        const type = this.typeOfFigure(this.board[imageBoardIndex]);
        if (
          this.connectedCells.indexOf(imageBoardIndex) != -1 &&
          type != "server"
        ) {
          sptriteKey += "_C";
        }
        const image = this._scene.add.image(
          column * this.TILE_SIZE,
          row * this.TILE_SIZE,
          sptriteKey,
        );
        image
          .setScale(this.TILE_SIZE / image.width, this.TILE_SIZE / image.height)
          .setOrigin(0, 0)
          .setInteractive()
          .on("pointerup", () => {
            if (!this._scene.dragState.active) {
              image.off("pointerup");
              image.setOrigin(0.5, 0.5);
              image.setPosition(
                image.x + (image.width * image.scaleX) / 2,
                image.y + (image.height * image.scaleY) / 2,
              );
              this._scene.tweens.add({
                targets: image,
                angle: 90,
                ease: "Linear",
                duration: 500,
                repeat: 0,
                onComplete: () => {
                  this.rotate(imageBoardIndex);
                  this.drawBoard();
                  if (this._scene.isGamePlaying) {
                    const isCompleted =
                      JSON.stringify(this.board) ===
                      JSON.stringify(this.solution);
                    this._scene.portalService?.send("MAKE_MOVE", {
                      solved: isCompleted,
                    });
                    if (
                      this._scene.movesLeft <= 0 ||
                      this._scene.portalService?.state?.context.solved
                    ) {
                      this._scene.endGame();
                    }
                  }
                },
              });
            }
          });
        this._boardContainer?.add(image);
      }
    }
    this.drawBoardLines();
  }

  private rotate(cell: number): number {
    let figure;
    figure = this.board[cell];
    figure = this.turnFigure(figure);
    this.board[cell] = figure;
    return figure;
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
    this.solution = Object.assign([], this.board);
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
