namespace App2 {

  export interface Solution {
    moves1: string;
    message: string;
    step: number;
    completed: boolean;
  }

  export class Solver {
    public solveCount: number = 0;
    public stepCount: number = 0;
    private solveStep: number = 0;
    public solverMoves = "";
    public startStep: number = 0;

    public cube: Cube;
    public static cubeTable: Tile[];

    constructor(cube: Cube) {
      this.cube = cube;
      Solver.cubeTable = new Array(54);
      this.copyTilesFromCube();
    }

    public reset(): void {
      // finish any move
      this.solverMoves = "";
      this.solveStep = 0;
      //this.solverMsg("");
      if (this.startStep !== -1) this.startStep = 0;
    }

    public solverMsg(msg: string): void {
      document.getElementById("solvermessage").innerText = msg;
    }

    public test1(): void {

    }

    public step(): void {
      
      if (this.solveStep < 7)++this.solveStep;

      this.solverMoves = "";
      //this.solveStep = 0;
      //if (this.startStep !== -1) this.startStep = 0;
      document.getElementById("solvermessage").innerText = `Step ${this.solveStep}`;

      console.log(`solver.step ${this.solveStep}`);

      this.solve(this.solveStep);
      let v1 = 1;
    }

    public solve(startStep: number): string {

      this.copyTilesFromCube();

      this.solverMsg("");
      let moves = "";
      //if (startStep === 0) this.solveStep = 0;
      if (!this.checkWhiteLayer()) {
        moves = this.runStep(this.whiteCross, 1, startStep);
        if (moves !== "" || startStep === 1) {
          this.solverSendMoves(moves, true, this.cube.mainSpeed);
          return "";
          return moves;
        }
        moves = this.runStep(this.whiteCorners, 2, startStep);
        if (moves !== "" || startStep === 2) {
          this.solverSendMoves(moves, true, this.cube.mainSpeed);
          return "";
          return moves;
        }
        if (startStep === 0) {
          this.solverSendMoves("X X ", true, this.cube.mainSpeed);
          return "";
          return "X X ";
        }
        else { 
          this.solverSendMoves("X X ", false);
          //this.doMoves("X X ");
        }
      }
      moves = this.runStep(this.middleSection, 3, startStep);
      if (moves !== "" || startStep === 3) return moves;
      moves = this.runStep(this.yellowCross, 4, startStep);
      if (moves !== "" || startStep === 4) return moves;
      moves = this.runStep(this.orientateYellowCross, 5, startStep);
      if (moves !== "" || startStep === 5) return moves;
      moves = this.runStep(this.yellowCorners, 6, startStep);
      if (moves !== "" || startStep === 6) return moves;
      moves = this.runStep(this.orientateYellowCorners, 7, startStep);
      if (moves !== "" || startStep === 7) return moves;

      return "";
    }

    private runStep = (stepFunction: Function, step: number, targetStep: number): string => {
      let this2 = this;
      while (true) {
        let moves = stepFunction();
        if (moves === "") {
          if (step === 7) this.solverMsg(`Cube is Solved!`);
          else this.solverMsg(`Step ${step} DONE!`);
          this.solverSendMoves(moves, true, this.cube.mainSpeed);
          return "";
        }
        else {
          if (targetStep === 0) return moves;
          this.solverSendMoves(moves, false);
        }
      }
    }

    private copyTilesFromCube() {
      for (let ix = 0; ix < Cube.cubeTable.length; ++ix) {
        let tile = Cube.cubeTable[ix];
        let tile1: Tile = new Tile(-100, -100, tile.tileIx, null);
        tile1.color = tile.color;
        tile1.color2 = tile.color2;
        tile1.color3 = tile.color3;
        Solver.cubeTable[ix] = tile1;
      }
    }

    private solverSendMoves(moves: string, execute = false, speed = 200): void {
      if (moves.length % 2 === 1) {
        throw new Error(`Bad input to sendMoves ${moves}`);
      }
      if (execute) {
        this.cube.sendMoves(moves, execute, speed);
        return;
      }
      let queue = this.cube.movesPendingQueue;
      for (let i = 0; i < moves.length; i += 2) {
        let move = moves.substr(i, 2);
        this.cube.rotateCubeTable(move, Solver.cubeTable);
        queue.push(move);
      }
    }

    private checkWhiteLayer = (): boolean => {
      //TODO allow white to be on any face and move it to bottom
      for (let i = 0; i < 9; ++i) {
        if (this.getTile(CubeFace.D, i).color !== TileColor.White) {
          return false;
        }
      }
      for (let i = 0; i < 4; ++i) {
        for (let j = 6; j < 9; ++j) {
          if (this.getTile(i, j).color !== this.getTile(i, 4).color) {
            return false;
          }
        }
      }
      return true;
    }

    private whiteOnTop = (): string => {
      let moves: string = "";
      if (this.getTile(CubeFace.U, 4).color === TileColor.White) {
        moves = "";
      }
      else if (this.getTile(CubeFace.D, 4).color === TileColor.White) {
        moves = "X X ";
      }
      else if (this.getTile(CubeFace.L, 4).color === TileColor.White) {
        moves = "Z ";
      }
      else if (this.getTile(CubeFace.R, 4).color === TileColor.White) {
        moves = "Z'";
      }
      else if (this.getTile(CubeFace.B, 4).color === TileColor.White) {
        moves = "X'";
      }
      else {
        throw new Error("White on top - Can't find white face");
      }
      console.log(`White On Top m=${moves}`);
      return moves;
    }

    private findColors(color: TileColor, color2: TileColor, color3: TileColor | null = null): number {
      if (color3 !== null) {
        for (let i: number = 0; i < Solver.cubeTable.length; i++) {
          let tile1: Tile = this.getTile(i);
          if (tile1.color === color && tile1.color3 === color3) {
            return i;
          }
        }
      }
      else {
        for (let i: number = 0; i < Solver.cubeTable.length; i++) {

          let tile1: Tile = this.getTile(i);
          if (tile1.color === color && tile1.color2 === color2 && tile1.color3 === TileColor.none) {
            return i;
          }
        }
      }
      return -1;
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

    private whiteCross = (): string => {
      let moves: string = this.whiteOnTop();
      if (moves !== "") return moves;

      let front: TileColor = this.getTile(CubeFace.F, 4).color;
      let ixWhite = this.findColors(TileColor.White, front);
      console.assert(ixWhite !== -1, `whiteCross1 sidePiece White/${front} not found`);

      let face: CubeFace = Math.floor(ixWhite / 9);
      let relTile = ixWhite % 9;
      switch (face) {
        case CubeFace.F:
          switch (relTile) {
            case 1: moves = "F'U L'U'"; break;
            case 3: moves = "U L'U'L "; break;
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
      if ((this.getTile(CubeFace.U, 1).color === TileColor.White)
        && (this.getTile(CubeFace.U, 3).color === TileColor.White)
        && (this.getTile(CubeFace.U, 5).color === TileColor.White)
        && (this.getTile(CubeFace.L, 1).color === this.getTile(CubeFace.L, 4).color)
        && (this.getTile(CubeFace.B, 1).color === this.getTile(CubeFace.B, 4).color)
        && (this.getTile(CubeFace.R, 1).color === this.getTile(CubeFace.R, 4).color)
      ) {
      }
      else {
        moves += "Y'";
      }
      console.log(`White Cross m=${moves}`);
      return moves;
    }

    private whiteCorners = (): string => {
      // Find tile that belongs in Front top right
      let front: TileColor = this.getTile(CubeFace.F, 4).color;
      let ixWhite = this.findColors(TileColor.White, null, front);
      if (ixWhite === -1) {
        throw new Error("whiteCorner1 piece not found");
      }
      let moves = "";
      let face: CubeFace = Math.floor(ixWhite / 9);
      let tileOnFace = ixWhite % 9;
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
            case 8: moves = "R'D R"; break;
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
      if ((this.getTile(CubeFace.U, 0).color === TileColor.White)
        && (this.getTile(CubeFace.U, 2).color === TileColor.White)
        && (this.getTile(CubeFace.U, 6).color === TileColor.White)
        && (this.getTile(CubeFace.L, 2).color === this.getTile(CubeFace.L, 4).color)
        && (this.getTile(CubeFace.B, 2).color === this.getTile(CubeFace.B, 4).color)
        && (this.getTile(CubeFace.R, 2).color === this.getTile(CubeFace.R, 4).color)
      ) {
        if (moves === "") {
          console.log(`white Corner Done`);
        }
      }
      else {
        moves += "Y'";
      }
      console.log(`m=${moves}`);
      return moves;
    }

    private middleSection = (): string => {
      let moves = "";
      for (let i = 7; i > 0; i -= 2) {
        let tile1 = this.getTile(CubeFace.U, i);
        if (tile1.color !== TileColor.Yellow && tile1.color2 !== TileColor.Yellow) {
          let frontColor: TileColor = this.getTile(CubeFace.F, 4).color;
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
          return moves;
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
          return moves;

        }
        else if (this.getTile(i, 4).color !== this.getTile(i, 5).color) {
          moves += "U R U'R'U'F'U F ";
          console.log(`m=${moves} `);
          return moves;
        }

      }
      //console.log(`midSection steps=${stepCount}`);
      //stepCount = 0;
      return "";
    }

    private yellowCross = (): string => {
      let moves = "";
      for (let i = 7; i > 0; i -= 2) {
        if (this.getTile(CubeFace.U, i).color !== TileColor.Yellow) {
          if (i === 5) moves = "U ";
          else if (i === 3) moves = "U'";
          else if (i === 1) moves = "U U ";
          moves += "R'U'F'U F R U'";
          return moves;
        }
      }
      //Debug.WriteLine($"Yellow cross steps={stepCount}");
      //stepCount = 0;
      return "";
    }

    private orientateYellowCross = (): string => {
      let moves = "";

      //// Possible new logic
      //let faces: number[] = [CubeFace.F, CubeFace.L, CubeFace.B, CubeFace.R, CubeFace.F];
      //let moveFace = -1;
      //for (let i = 0; i < 4; ++i) {
      //  let color1 = Cube.tile(faces[i], 1).color;
      //  let color2 = Cube.tile(faces[i + 1], 1).color;

      //  if (color2 !== (color1 + 1) % 4) {
      //    switch (faces[i]) {
      //      case CubeFace.L: moves = "U'"; break;
      //      case CubeFace.B: moves = "UU"; break;
      //      case CubeFace.R: moves = "U"; break;
      //      case CubeFace.F: break;
      //    }
      //  }
      //}

      for (let i = 0; i < 4; i++) {
        let j = (i + 3) % 4;
        let face: TileColor = this.getTile(i, 1).color;
        let prevFace: TileColor = this.getTile(j, 1).color;
        if ((face + 1) % 4 !== (prevFace) % 4) {
          if (i === 3) moves = "U'";
          else if (i === 2) moves = "U U ";
          else if (i === 1) moves = "U ";
          moves += "R U R'U R U U R'";
          //Debug.Write($"m={moves} ");
          //cube.rotateBoth(moves);
          return moves;
        }
      }
      let front: TileColor = this.getTile(CubeFace.F, 4).color;
      let top: TileColor = this.getTile(CubeFace.F, 1).color;
      let rotate = (top + 4 - front) % 4;

      if (rotate === 0) {
        //Debug.WriteLine($"orientateYellowCross steps={stepCount}");
        //stepCount = 0;
        return "";
      }
      if (rotate === 1) moves = "U ";
      else if (rotate === 2) moves = "U U ";
      else if (rotate === 3) moves = "U'";
      //cube.rotateBoth(moves);

      return moves;
    }

    private yellowCorners = (): string => {
      let validCount = 0;
      let validFace = -1;
      for (let i = 0; i < 4; i++) {
        let tile1: Tile = this.getTile(i, 2);
        let colors: TileColor[] = new Array(3);
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
        return "";
      }
      let moves: string = "";
      if (validCount !== 0) {
        if (validFace === 1) moves = "Y ";
        else if (validFace === 2) moves = "Y Y ";
        else if (validFace === 3) moves = "Y'";
      }
      moves += "U R U'L'U R'U'L ";
      //Debug.Write($"m={moves} ");
      //cube.rotateBoth(moves);
      return moves;
    }

    public checkSolved(): boolean {
      this.copyTilesFromCube();
      for (let i = 0; i < 6; ++i) {
        let faceColor = this.getTile(i, 4).color;
        for (let j = 0; j < 9; ++j) {
          if (this.getTile(i, j).color !== faceColor) {
            return false;
          }
        }
      }
      return true; 
    }

    private orientateYellowCorners = (): string => {
      //TODO if more than incorrect rotate top
      let moves: string = "";
      let corner: number[] = [8, 2, 0, 6];
      for (let i of corner) {
        if (this.getTile(CubeFace.U, i).color !== TileColor.Yellow) {
          if (this.getTile(CubeFace.U, i).color2 !== TileColor.Yellow) {
            moves += "R'D'R D R'D'R D ";
          }
          moves += "R'D'R D R'D'R D ";
        }
        moves += "U ";
      }
      if (moves === "U U U U ") {
        return "";
      }

      //for (let i = 8; i >= 0; i -= 2) {
      //  if (i == 4) continue;
      //  if (Cube.tile(CubeFace.U, i).color != TileColor.Yellow) {
      //    if (i === 6) moves = "U'";
      //    else if (i === 0) moves = "UU";
      //    else if (i === 2) moves = "U'";
      //    moves += "R'D'RDR'D'RD";
      //    //Debug.Write($"m={moves} ");
      //    //cube.rotateBoth(moves);
      //    return moves;
      //  }
      //}
      //let frontColor: TileColor = Cube.tile(CubeFace.F, 4).color;
      //for (let i = 0; i < 4; i++) {
      //  if (Cube.tile(i, 0).color == frontColor) {
      //    if (i == 0) {
      //      //Debug.WriteLine($"orientateYellowCorners steps={stepCount} total={solveCount}");
      //      //stepCount = 0;
      //      //solveCount = 0;
      //      return "";
      //    }
      //    if (i == 1) moves = "U";
      //    else if (i == 2) moves = "UU";
      //    else if (i == 3) moves = "U'";
      //    //Debug.Write($"m={moves} ");
      //    //cube.rotateBoth(moves);
      //    return moves;
      //  }
      //}
      return moves;
    }
  }
}
