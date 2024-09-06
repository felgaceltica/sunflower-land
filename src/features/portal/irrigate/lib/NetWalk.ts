import _ from "lodash";

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

  constructor(options: NetwalkOptions = {}) {
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

    this.buildMatrix();

    this.serverVector = new NewWalkVector(
      1 + _.random(this.options.columns - 2),
      1 + _.random(this.options.rows - 2),
      0,
      0,
    );
    //this.serverVector = new NewWalkVector(1, 1, 0, 0);
    this.putOnBoard(this.serverVector, 16);
    //  while (this.tick()) {

    //  }
    // console.log(this.board);
    // console.log(this.neighbours);
    // console.log(this.board);
    // const drawTicks = setInterval(() => {
    //   if (!this.tick()) {
    //     clearInterval(drawTicks);
    //     this.drawingIsDone = true;
    //   }
    // }, 1);

    // const randomizeTicks = setInterval(() => {
    //   if (!this.drawingIsDone) {
    //     return;
    //   }

    //   if (!this.randomize()) {
    //     this.draw();
    //     clearInterval(randomizeTicks);
    //     this.highlightConnectedNeighboursOf(this.serverVector);
    //   }
    // }, 1);

    // this.container.on('selectstart', () => false).children().each((i, tail) => {
    //   $(tail).on('click', (event) => {
    //     this.rotate(i);
    //     $('>', this.container).each(function() {
    //       $(this).attr('class', 'tail');
    //     });
    //     this.connectedCells = [];
    //     this.highlightConnectedNeighboursOf(this.serverVector);
    //   });
    // });
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
    // for (let cell = 0; cell < this.options.columns! * this.options.rows!; cell++) {
    //   this.container.append('<div class="tail"><div class="tail__blank"></div></div>');
    // }
    // console.log(this.board);
    // console.log(this.neighbours);
  }

  private putOnBoard(vector: Phaser.Math.Vector2, directionBit: number) {
    const cell = this.getCellByVector(vector);
    if (this.board[cell] === 0) {
      this.toDraw.push(vector);
      this.toRandomize.push(vector);
    }
    // console.log(cell);
    // console.log(this.board[cell]);
    this.board[cell] |= directionBit;
    // console.log(directionBit);
    // console.log(this.board[cell]);
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

  private tick(): boolean {
    if (this.toDraw.length === 0) {
      return false;
    }
    let madeConnection = false;
    while (!madeConnection && this.toDraw.length > 0) {
      const i = _.random(this.toDraw.length - 1);
      const vector = this.toDraw[i];
      const cell = this.getCellByVector(vector);
      const d = this.randomFreeDir(cell);
      // console.log(d);
      if (d) {
        this.putOnBoard(vector, d.flag);
        // console.log(vector.x, vector.y);
        // console.log(d.x, d.y);
        // console.log("-");
        this.putOnBoard(this.addVector(vector, d), d.opposite);
        madeConnection = true;
      }
      if ((this.neighbours[cell] & 15) === 0) {
        this.toDraw.splice(i, 1);
      }
    }
    return true;
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
