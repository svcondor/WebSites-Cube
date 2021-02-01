import { Cube, CubeFace, TileColor } from './Cube.js';
import { Tile } from './Tile.js';

interface SolverResult {
  moves?: string;
  step?: number;
  subStep?: number;
}

export class Solver {
  //private solveStep: number = 0;
  private cube: Cube;
  private static cubeTable: Tile[];
  public targetStep = 0;
  private totalMoves = "";
  constructor(cube: Cube) {
    this.cube = cube;
    Solver.cubeTable = new Array(54);
    this.copyTilesFromCube();
  }

  public checkIfSolved(): boolean {
    this.copyTilesFromCube();
    for (let i = 0; i < 6; ++i) {
      const faceColor = this.getTile(i, 4).color;
      for (let j = 0; j < 9; ++j) {
        if (this.getTile(i, j).color !== faceColor) {
          return false;
        }
      }
    }
    return true;
  }

  public reset(): void {
    //this.solveStep = 0;
  }

  public solverMsg(msg: string): void {
    document.getElementById("solvermessage").innerText = msg;
  }

  public step(target = 0): void {
    // let solveStep = this.solveStep;
    // if (this.solveStep < 7)++this.solveStep;
    // document.getElementById("solvermessage").innerText = `Step ${this.solveStep}`;
    // console.log(`solver.step ${this.solveStep}`);

    this.copyTilesFromCube();

    //this.solverMsg("");
    const result: SolverResult = { step: 1, subStep: 1, moves: "" };
    this.totalMoves = "";

    for (;;) {
      //this.whiteCross(result);
      if (this.runStep(this.whiteCross, result)) break;
      if (result.step < 3) {
        if (this.runStep(this.whiteCorners, result)) break;
      }
      if (this.runStep(this.middleSection, result)) break;
      if (this.runStep(this.yellowCross, result)) break;
      if (this.runStep(this.orientateYellowCross, result)) break;
      if (this.runStep(this.yellowCorners, result)) break;
      if (this.runStep(this.orientateYellowCorners, result)) break;
      break;
    }
    if (result.moves !== "") {
      this.solverMsg(`Step ${result.step}.${result.subStep}`);
      this.solverSendMoves(result.moves, true);
    }
    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private runStep = (stepFunction: Function, result: SolverResult): boolean => {
    for (;;) {
      stepFunction(result);
      //if (this.targetStep === 0 || true) {
        if (result.moves === "") return false;
        else return true;
      //  break;
      // }
      // else {
      //   this.totalMoves += result.moves;
      //   if (result.step > this.targetStep) {
      //     if (result.moves === "") return false;
      //     else {
      //       this.totalMoves += result.moves;
      //       result.moves = this.totalMoves;
      //       return true;
      //     }
      //   }
      //   else if (result.step === this.targetStep
      //     && result.moves === "") {
      //   }
      // }
    }
  }

  private solverSendMoves(moves: string, execute = false, speed = this.cube.mainSpeed): void {
    if (moves.length % 2 === 1) {
      throw new Error(`Bad input to sendMoves ${moves}`);
    }
    if (execute) {
      this.cube.sendMoves(moves, execute, 400);
      return;
    }
    const queue = this.cube.movesPendingQueue;
    for (let i = 0; i < moves.length; i += 2) {
      const move = moves.substr(i, 2);
      this.cube.rotateCubeTable(move, Solver.cubeTable);
      queue.push(move);
    }
  }

  private checkWhiteLayer = (result: SolverResult): void => {
    //TODO allow white to be on any face and move it to bottom
    let face: CubeFace = 0;
    let moves = "";
    for (; face < 6; ++face) {
      if (this.getTile(face, 4).color === TileColor.White) {
        break;
      }
    }
    let nextTopFace = TileColor.Yellow;
    result.step = 3;
    result.subStep = 1;
    for (let i = 0; i < 9; ++i) {
      if (this.getTile(face, i).color !== TileColor.White) {
        nextTopFace = TileColor.White;
        result.step = 1;
        result.subStep = 1;
        break;
      }
    }
    if (nextTopFace === TileColor.Yellow) {
      for (face = 0; face < 6; ++face) {
        if (this.getTile(face, 4).color === TileColor.Yellow) {
          break;
        }
      }
    }
    switch (face) {
      case CubeFace.F: moves = "X "; break;
      case CubeFace.R: moves = "Z'"; break;
      case CubeFace.B: moves = "X'"; break;
      case CubeFace.L: moves = "Z "; break;
      case CubeFace.U: moves = ""; break;
      case CubeFace.D: moves = "X X "; break;
    }
    result.moves = moves;
    return;
  }

  private whiteCross = (result: SolverResult): void => {
    this.checkWhiteLayer(result);
    if (result.moves !== "" || result.step === 3) {
      return;
    }
    // let moves: string = this.whiteOnTop();
    // if (moves !== "") return moves;
    let moves = result.moves;

    const frontColor: TileColor = this.getTile(CubeFace.F, 4).color;
    const ixWhite = this.findColors(TileColor.White, frontColor);
    console.assert(ixWhite !== -1, `whiteCross1 sidePiece White/${frontColor} not found`);

    const face: CubeFace = Math.floor(ixWhite / 9);
    const relTile = ixWhite % 9;
    switch (face) {
      case CubeFace.F:
        switch (relTile) {
          case 1: moves = "F'U L'U'"; break;
          case 3: moves = "U L'U'"; break; // was "U L'U'L "
          case 5: moves = "U'R U R'"; break;
          case 7: moves = "F U L'U'"; break;
        }
        break;
      case CubeFace.R:
        switch (relTile) {
          case 1: moves = "R'F'"; break;
          case 3: moves = "F'"; break;
          case 5: moves = "R R F'R'R'"; break;
          case 7: moves = "R F'R'"; break;
        }
        break;
      case CubeFace.B:
        switch (relTile) {
          case 1: moves = "B'U'R'U R "; break;
          case 3: moves = "U'R'U "; break;
          case 5: moves = "U L U'L'"; break;
          case 7: moves = "B U'R'U R B'"; break;
        }
        break;
      case CubeFace.L:
        switch (relTile) {
          case 1: moves = "L F "; break;
          case 3: moves = "L L F L'L'"; break;
          case 5: moves = "F "; break;
          case 7: moves = "L'F L "; break;
        }
        break;
      case CubeFace.U:
        switch (relTile) {
          case 1: moves = "B B D D F F "; break;
          case 3: moves = "L L D F F "; break;
          case 5: moves = "R R D'F F "; break;
          case 7: moves = ""; break;
        }
        break;
      case CubeFace.D:
        switch (relTile) {
          case 1: moves = "F F "; break;
          case 3: moves = "D F F "; break;
          case 5: moves = "D'F F "; break;
          case 7: moves = "D D F F "; break;
        }
        break;
    }
    let subStep = 1;
    if (this.getTile(CubeFace.U, 5).color === TileColor.White
      && this.getTile(CubeFace.R, 1).color === this.getTile(CubeFace.R, 4).color) {
      subStep = 2;
      if (this.getTile(CubeFace.U, 1).color === TileColor.White
        && this.getTile(CubeFace.B, 1).color === this.getTile(CubeFace.B, 4).color) {
        subStep = 3;
        if (this.getTile(CubeFace.U, 3).color === TileColor.White
          && this.getTile(CubeFace.L, 1).color === this.getTile(CubeFace.L, 4).color) {
          subStep = 4;
        }
      }
    }
    if (subStep !== 4) {
      moves += "Y'";
    }
    console.log(`White Cross m=${moves}`);

    result.moves = moves;
    result.step = 1;
    result.subStep = subStep;
    return;
  }

  private whiteCorners = (result: SolverResult): void => {
    // Find tile that belongs in Front top right
    const front: TileColor = this.getTile(CubeFace.F, 4).color;
    const ixWhite = this.findColors(TileColor.White, null, front);
    if (ixWhite === -1) {
      throw new Error("whiteCorner1 piece not found");
    }
    let moves = "";
    const face: CubeFace = Math.floor(ixWhite / 9);
    const tileOnFace = ixWhite % 9;
    switch (face) {
      case CubeFace.F:
        switch (tileOnFace) {
          case 0: moves = "F'D D F F D'F'"; break;
          case 2: moves = "F D D F'R'D D R "; break;
          case 6: moves = "D D F D'F'"; break;
          case 8: moves = "D'R'D R "; break;
        }
        break;
      case CubeFace.R:
        switch (tileOnFace) {
          case 0: moves = "R'D D R F D D F'"; break;
          case 2: moves = "R D R'D R'D R "; break;
          case 6: moves = "D F D'F'"; break;
          case 8: moves = "D D R'D R "; break;
        }
        break;
      case CubeFace.B:
        switch (tileOnFace) {
          case 0: moves = "B'F D'B F'"; break;
          case 2: moves = "B D B'R'D R "; break;
          case 6: moves = "F D'F'"; break;
          case 8: moves = "D R'D R "; break;
        }
        break;
      case CubeFace.L:
        switch (tileOnFace) {
          case 0: moves = "L'D'L F D'F'"; break;
          case 2: moves = "R'L D R L'"; break;
          case 6: moves = "F D D F'"; break;
          case 8: moves = "R'D R "; break;
        }
        break;
      case CubeFace.U:
        switch (tileOnFace) {
          case 0: moves = "L'R'D'L D'R "; break;
          case 2: moves = "R D R'D'F D'F'"; break;
          case 6: moves = "F'D F D D F D'F'"; break;
          case 8: moves = ""; break;
        }
        break;
      case CubeFace.D:
        switch (tileOnFace) {
          case 0: moves = "D F D'F'D R'D R "; break;
          case 2: moves = "F D'F'D R'D R "; break;
          case 6: moves = "F D F'D F D'F'"; break;
          case 8: moves = "D F D F'D F D'F'"; break;
        }
        break;
    }

    let subStep = 1;
    if (this.getTile(CubeFace.U, 2).color === TileColor.White
      && this.getTile(CubeFace.R, 2).color === this.getTile(CubeFace.R, 4).color) {
      subStep = 2;
      if (this.getTile(CubeFace.U, 0).color === TileColor.White
        && this.getTile(CubeFace.B, 2).color === this.getTile(CubeFace.B, 4).color) {
        subStep = 3;
        if (this.getTile(CubeFace.U, 6).color === TileColor.White
          && this.getTile(CubeFace.L, 2).color === this.getTile(CubeFace.L, 4).color) {
          subStep = 4;
        }
      }
    }
    if (subStep !== 4) {
      moves += "Y'";
    }
    console.log(`White Corners m=${moves}`);

    result.moves = moves;
    result.step = 2;
    result.subStep = subStep;
  }

  private middleSection = (result: SolverResult): void => {
    let moves = "";
    result.subStep = 0;
    result.step = 3;
    for (let i = 7; i > 0; i -= 2) {
      const tile1 = this.getTile(CubeFace.U, i);
      if (tile1.color !== TileColor.Yellow && tile1.color2 !== TileColor.Yellow) {
        const frontColor: TileColor = this.getTile(CubeFace.F, 4).color;
        let rotates1 = frontColor - tile1.color2;
        let rotates2 = 0;
        if (i === 1) rotates2 = 2;
        if (i === 3) rotates2 = 3;
        if (i === 5) rotates2 = 1;
        rotates2 -= rotates1;
        rotates1 = ((rotates1 + 4) % 4);
        rotates2 = ((rotates2 + 4) % 4);
        if (rotates1 === 1) moves = "Y ";
        else if (rotates1 === 2) moves = "Y Y ";
        else if (rotates1 === 3) moves = "Y'";
        if (rotates2 === 1) moves += "U ";
        else if (rotates2 === 2) moves += "U U ";
        else if (rotates2 === 3) moves += "U'";
        else {
          if (tile1.color === this.getTile(CubeFace.R, 4).color) {
            if (moves.length >= 2 && moves.substr(moves.length - 2) === "U'") {
              moves = moves.substr(0, moves.length - 2) + "R U'R'U'F'U F ";
            }
            else if (moves.length >= 2 && moves.substr(moves.length - 2) === "U U ") {
              moves = moves.substr(0, moves.length - 2) + "U'R U'R'U'F'U F ";
            }
            else moves += "U R U'R'U'F'U F ";
          }
          else {
            if (moves.length >= 1 && moves.substr(moves.length - 1) === "U ") {
              moves = moves.substr(0, moves.length - 1) + "L'U L U F U'F'";
            }
            else moves += "U'L'U L U F U'F'";
          }
        }
        //console.log(`m=${moves}`);
        result.moves = moves;
        return;
      }
    }


    //      Front col
    //      0  1  2  3        Blue = 0,        F = 0,
    //T  0  0  1  2  1-       Orange = 1,      R = 1,
    //O  1  1- 0  1  2        Green = 2,       B = 2,
    //P  2  2  1- 0  1        Red = 3,         L = 3,
    //   3  1  2  1- 0

    for (let i = 0; i < 4; ++i) {
      moves = "";
      if (i === 1) moves = "Y ";
      else if (i === 2) moves = "Y Y ";
      else if (i === 3) moves = "Y'";
      if (this.getTile(i, 4).color !== this.getTile(i, 3).color) {
        moves += "U'L'U L U F U'F'";
        console.log(`middle section m=${moves} `);
        result.moves = moves;
        return;

      }
      else if (this.getTile(i, 4).color !== this.getTile(i, 5).color) {
        moves += "U R U'R'U'F'U F ";
        console.log(`m=${moves} `);
        result.moves = moves;
        return;
      }

    }
    //console.log(`midSection steps=${stepCount}`);
    //stepCount = 0;
    result.moves = "";
    return;
  }

  private yellowCross = (result: SolverResult): void => {
    let moves = "";
    result.subStep = 1;
    result.step = 4;
    for (let i = 7; i > 0; i -= 2) {
      if (this.getTile(CubeFace.U, i).color !== TileColor.Yellow) {
        if (i === 5) moves = "U ";
        else if (i === 3) moves = "U'";
        else if (i === 1) moves = "U U ";
        moves += "R'U'F'U F R U'";
        result.moves = moves;
        return;
      }
    }
    //Debug.WriteLine($"Yellow cross steps={stepCount}");
    //stepCount = 0;
    result.moves = "";
    return;
  }

  private orientateYellowCross = (result: SolverResult): void => {
    let moves = "";
    result.step = 5;
    result.subStep = 1;

    for (let i = 0; i < 4; i++) {
      const j = (i + 3) % 4;
      const face: TileColor = this.getTile(i, 1).color;
      const prevFace: TileColor = this.getTile(j, 1).color;
      if ((face + 1) % 4 !== (prevFace) % 4) {
        if (i === 3) moves = "U'";
        else if (i === 2) moves = "U U ";
        else if (i === 1) moves = "U ";
        moves += "R U R'U R U U R'";
        //Debug.Write($"m={moves} ");
        //cube.rotateBoth(moves);
        result.moves = moves;
        return;
      }
    }
    const front: TileColor = this.getTile(CubeFace.F, 4).color;
    const top: TileColor = this.getTile(CubeFace.F, 1).color;
    const rotate = (top + 4 - front) % 4;

    if (rotate === 0) {
      //Debug.WriteLine($"orientateYellowCross steps={stepCount}");
      //stepCount = 0;
      result.moves = "";
      return;
    }
    if (rotate === 1) moves = "U ";
    else if (rotate === 2) moves = "U U ";
    else if (rotate === 3) moves = "U'";
    //cube.rotateBoth(moves);

    result.moves = moves;
    return;
  }

  private yellowCorners = (result: SolverResult): void => {
    result.step = 6;
    result.subStep = 1;
    let validCount = 0;
    let validFace = -1;
    for (let i = 0; i < 4; i++) {
      const tile1: Tile = this.getTile(i, 2);
      const colors: TileColor[] = new Array(3);
      colors[0] = tile1.color;
      colors[1] = tile1.color2;
      colors[2] = tile1.color3;
      let j = 0;
      for (; j < 3; j++) {
        if (colors[j] !== TileColor.Yellow
          && colors[j] !== this.getTile(i, 4).color
          && colors[j] !== this.getTile((i + 1) % 4, 4).color) {
          break;
        }
      }
      if (j >= 3) {
        if (validCount === 0) validFace = i;
        ++validCount;
      }
    }
    if (validCount === 4) {
      //Debug.WriteLine($"yellowCorners steps={stepCount}");
      //stepCount = 0;
      result.moves = "";
      return;
    }
    let moves = "";
    if (validCount !== 0) {
      if (validFace === 1) moves = "Y ";
      else if (validFace === 2) moves = "Y Y ";
      else if (validFace === 3) moves = "Y'";
    }
    moves += "U R U'L'U R'U'L ";
    //Debug.Write($"m={moves} ");
    //cube.rotateBoth(moves);
    result.moves = moves;
    return;
  }

  private orientateYellowCorners = (result: SolverResult): void => {
    result.step = 7;
    result.subStep = 1;

    //TODO if more than incorrect rotate top
    let moves = "";
    const corner: number[] = [8, 2, 0, 6];
    for (const i of corner) {
      if (this.getTile(CubeFace.U, i).color !== TileColor.Yellow) {
        if (this.getTile(CubeFace.U, i).color2 !== TileColor.Yellow) {
          moves += "R'D'R D R'D'R D ";
        }
        moves += "R'D'R D R'D'R D ";
        result.moves = moves;
      }
      moves += "U ";
    }
    result.moves = moves;
  }

  // get Tile by index (0-53) or by face (0-5) and tile (0-8)
  private getTile(face: number | CubeFace, ix?: number): Tile {
    let ix1: number;
    if (ix || ix === 0) {
      ix1 = face * 9 + ix;
    }
    else {
      ix1 = face;
    }
    return Solver.cubeTable[ix1];
  }

  private findColors(color: TileColor, color2: TileColor, color3: TileColor | null = null): number {
    if (color3 !== null) {
      for (let i = 0; i < Solver.cubeTable.length; i++) {
        const tile1: Tile = this.getTile(i);
        if (tile1.color === color && tile1.color3 === color3) {
          return i;
        }
      }
    }
    else {
      for (let i = 0; i < Solver.cubeTable.length; i++) {

        const tile1: Tile = this.getTile(i);
        if (tile1.color === color && tile1.color2 === color2 && tile1.color3 === TileColor.none) {
          return i;
        }
      }
    }
    return -1;
  }

  private copyTilesFromCube() {
    for (let ix = 0; ix < Cube.cubeTable.length; ++ix) {
      const tile = Cube.cubeTable[ix];
      const tile1: Tile = new Tile(-100, -100, tile.tileIx, null);
      tile1.color = tile.color;
      tile1.color2 = tile.color2;
      tile1.color3 = tile.color3;
      Solver.cubeTable[ix] = tile1;
    }
  }
}
