import { Cube, CubeFace, TileColor } from './Cube.js';
import { Tile } from './Tile.js';
import { Piece } from './Piece.js';
  
export class CubeBuilder {
  private testCount = 1;
  private cube: Cube;
  private scene: BABYLON.Scene;

  constructor(cube1: Cube, scene: BABYLON.Scene) {
  this.cube = cube1;
  this.scene = scene;
  
  Cube.cubeTable = new Array(54);
  this.buildTileColorTable();
  this.buildTables();
  this.drawFace(CubeFace.F);
  this.rotateImage("Y ");
  this.drawFace(CubeFace.R);
  this.rotateImage("Y ");
  this.drawFace(CubeFace.B);
  this.rotateImage("Y ");
  this.drawFace(CubeFace.L);
  this.rotateImage("Y ");
  this.rotateImage("X'");
  this.drawFace(CubeFace.U);
  this.rotateImage("X ");
  this.rotateImage("X ");
  this.drawFace(CubeFace.D);
  this.rotateImage("X'");

  }

  private buildTileColorTable(): void {
    let sm1 = new BABYLON.StandardMaterial("BlueMat", this.scene);
    sm1.emissiveColor = new BABYLON.Color3(0, 0, 1);
    Cube.tileColors[TileColor.Blue as number] = sm1;
    sm1 = new BABYLON.StandardMaterial("OrangeMat", this.scene);
    sm1.emissiveColor = new BABYLON.Color3(.9, .67, 0);   //2, 1.5, 0
    Cube.tileColors[TileColor.Orange as number] = sm1;
    sm1 = new BABYLON.StandardMaterial("GreenMat", this.scene);
    sm1.emissiveColor = new BABYLON.Color3(0, 1, 0);
    Cube.tileColors[TileColor.Green] = sm1;
    sm1 = new BABYLON.StandardMaterial("RedMat", this.scene);
    sm1.emissiveColor = new BABYLON.Color3(2, 0, 0);
    Cube.tileColors[TileColor.Red] = sm1;
    sm1 = new BABYLON.StandardMaterial("WhiteMat", this.scene);
    sm1.emissiveColor = new BABYLON.Color3(2, 2, 2);
    Cube.tileColors[TileColor.White] = sm1;
    sm1 = new BABYLON.StandardMaterial("YellowMat", this.scene);
    sm1.emissiveColor = new BABYLON.Color3(2, 2, 0);
    Cube.tileColors[TileColor.Yellow] = sm1;
    sm1 = new BABYLON.StandardMaterial("GrayMat", this.scene);
    sm1.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    Cube.tileColors[TileColor.Gray] = sm1;
    sm1 = new BABYLON.StandardMaterial("BlackMat", this.scene);
    sm1.diffuseColor = new BABYLON.Color3(1, 1, 1);
    Cube.tileColors[TileColor.Black] = sm1;
  }

  private buildTables(): void {
    this.cube.clockMoves = [
      [27, 27, 27, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, 2, 4, 6, -2, 200, 2, -6, -4, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [45, 0, 0, 45, 0, 0, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 0, 0, 16, 0, 0, 10, 2, 4, 6, -2, 0, 2, -6, -4, -2, -36, 0, 0, -36, 0, 0, -36, 0, 0, -19, 0, 0, -25, 0, 0, -31, 0, 0],
      [2, 4, 6, -2, 200, 2, -6, -4, -2, 38, 0, 0, 34, 0, 0, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 11, 0, 0, 7, 0, 0, 0, 0, 0, 0, -33, -31, -29, -16, -14, -12, 0, 0, 0, 0, 0, 0],
      [0, 0, 36, 0, 0, 36, 0, 0, 36, 2, 4, 6, -2, 200, 2, -6, -4, -2, 35, 0, 0, 29, 0, 0, 23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -14, 0, 0, -20, 0, 0, -26, 0, 0, -45, 0, 0, -45, 0, 0, -45],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 23, 0, 0, 21, 2, 4, 6, -2, 0, 2, -6, -4, -2, 24, 0, 0, 22, 0, 0, 20, 0, 0, -3, -7, -11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -34, -38, -42],
      [0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, -27, -27, -27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, -2, 200, 2, -6, -4, -2],
      [27, 27, 27, 27, 27, 27, 27, 27, 27, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, -9, 2, 4, 6, -2, 200, 2, -6, -4, -2, 6, 2, -2, 4, 200, -4, 2, -2, -6],
      [36, 36, 36, 36, 36, 36, 36, 36, 36, 2, 4, 6, -2, 200, 2, -6, -4, -2, 35, 33, 31, 29, 27, 25, 23, 21, 19, 6, 2, -2, 4, 200, -4, 2, -2, -6, -10, -12, -14, -16, -18, -20, -22, -24, -26, -45, -45, -45, -45, -45, -45, -45, -45, -45],
      [2, 4, 6, -2, 200, 2, -6, -4, -2, 38, 40, 42, 34, 36, 38, 30, 32, 34, 6, 2, -2, 4, 0, -4, 2, -2, -6, 11, 13, 15, 7, 9, 11, 3, 5, 7, -25, -23, -21, -29, -27, -25, -33, -31, -29, -16, -14, -12, -20, -18, -16, -24, -22, -20],
      [0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 0, 0, 27, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -12, 0, 0, -18, 0, 0, -24, 0, 0, -45, 0, 0, -45, 0, 0, -45, 0],
      [0, 0, 0, 27, 27, 27, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, -9, -9, -9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 0, 0, 36, 0, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 9, 0, 0, 5, 0, 0, 0, 0, -29, -27, -25, 0, 0, 0, 0, 0, 0, -20, -18, -16, 0, 0, 0]

    ];

    this.cube.antiMoves = new Array(12);

    for (let i = 0; i < 12; ++i) {
      this.cube.antiMoves[i] = new Array(54);
      for (let j = 0; j < 54; ++j) {
        if (this.cube.clockMoves[i][j] === 200) {
          this.cube.antiMoves[i][j] = 200;
        }
        else if (this.cube.clockMoves[i][j] === 0) {
          this.cube.antiMoves[i][j] = 0;
        }
        else if (this.cube.clockMoves[i][j] !== 0) {
          const j1 = j + this.cube.clockMoves[i][j];
          const j2 = j1 + this.cube.clockMoves[i][j1];  // 180
          const j3 = j2 + this.cube.clockMoves[i][j2];  // 270
          const j4 = j3 + this.cube.clockMoves[i][j3];  // 360
          //const a3 = this.cube.clockMoves[i][j3];
          if (j4 !== j) {
            throw new Error("error in table clockMoves");
          }
          this.cube.antiMoves[i][j] = j3 - j;
        }
        //print1 += `${this.antiMoves[i][j]},`;
      }
      //console.log(print1);
    }
    this.cube.sidePieces = [
      new Piece(TileColor.Blue, TileColor.White, null, 1, 43),
      new Piece(TileColor.Blue, TileColor.Orange, null, 5, 12),
      new Piece(TileColor.Blue, TileColor.Yellow, null, 7, 46),
      new Piece(TileColor.Blue, TileColor.Red, null, 3, 32),
      new Piece(TileColor.Orange, TileColor.White, null, 10, 41),
      new Piece(TileColor.Orange, TileColor.Green, null, 14, 21),
      new Piece(TileColor.Orange, TileColor.Yellow, null, 16, 50),
      new Piece(TileColor.Green, TileColor.White, null, 19, 37),
      new Piece(TileColor.Green, TileColor.Red, null, 23, 30),
      new Piece(TileColor.Green, TileColor.Yellow, null, 25, 52),
      new Piece(TileColor.Red, TileColor.White, null, 28, 39),
      new Piece(TileColor.Red, TileColor.Yellow, null, 34, 48)];
    this.cube.cornerPieces = [
      new Piece(TileColor.Blue, TileColor.Red, TileColor.White, 0, 29, 42),
      new Piece(TileColor.Blue, TileColor.White, TileColor.Orange, 2, 44, 9),
      new Piece(TileColor.Blue, TileColor.Yellow, TileColor.Red, 6, 45, 35),
      new Piece(TileColor.Blue, TileColor.Orange, TileColor.Yellow, 8, 15, 47),
      new Piece(TileColor.Green, TileColor.Orange, TileColor.White, 18, 11, 38),
      new Piece(TileColor.Green, TileColor.White, TileColor.Red, 20, 36, 27),
      new Piece(TileColor.Green, TileColor.Yellow, TileColor.Orange, 24, 53, 17),
      new Piece(TileColor.Green, TileColor.Red, TileColor.Yellow, 26, 33, 51)];
  }

  /** Draw each face at start up */
  private drawFace(cubeFace: CubeFace): void {
    let tileIx: number = cubeFace as number * 9;
    for (let y = 1; y >= -1; --y) {
      for (let x = -1; x <= 1; ++x) {
        if (y === 1 && x === 5) {
          //const a1 = 1;
        }
        else {
          const tile1: Tile = new Tile(x, y, tileIx, this.scene);
          Cube.cubeTable[tileIx] = tile1;
        }
        ++tileIx;
      }
    }
  }

  /** rotate the Cube as each face is built at start up */
  private rotateImage(move: string) {
    //let count = 0;
    let angle = 90;
    if (move.length > 1 && move.substr(1, 1) === "'") {
      angle = -90;
    }
    let axis: BABYLON.Vector3 = BABYLON.Axis.Z;
    switch (move.substr(0, 1)) {
      case "Y":
        axis = BABYLON.Axis.Y;
        break;
      case "X":
        axis = BABYLON.Axis.X;
        break;
      default:
        throw new Error("Move must be X or Y");
      //TODO why not handle Z
    }
    for (const item of Cube.cubeTable) {
      if (item != null && item.pivot != null) {
        item.pivot.rotate(axis, angle * Math.PI / 180, BABYLON.Space.WORLD);
        //++count;
      }
    }
  }
}
  